import { db } from "@/lib/db";
import {
  beninDayNumber,
  bucketByDay,
  buildChecklist,
  buildInsights,
  editionPhase,
  type EditionInput,
  type TaskInput,
  type TaskStatusKey,
} from "@/lib/cigibm-hub";

export async function listEditions() {
  return db.edition.findMany({
    select: { number: true, theme: true, dates: true, venue: true, eventDate: true, _count: { select: { participants: true } } },
    orderBy: { number: "asc" },
  });
}

// Édition affichée par défaut : la prochaine à venir, sinon la plus récente.
export function pickDefaultEdition(editions: { number: number; eventDate: Date | null }[], now: Date): number | null {
  if (editions.length === 0) return null;
  const today = beninDayNumber(now);
  const upcoming = editions
    .filter((e) => e.eventDate && beninDayNumber(e.eventDate) >= today)
    .sort((a, b) => a.eventDate!.getTime() - b.eventDate!.getTime());
  if (upcoming.length > 0) return upcoming[0].number;
  return Math.max(...editions.map((e) => e.number));
}

export async function getEditionHub(editionNumber: number, now: Date) {
  const edition = await db.edition.findUnique({ where: { number: editionNumber } });
  if (!edition) return null;

  const [participants, tasks, ambassadors, leadsToContact, leadsNeedingHelp, resources] = await Promise.all([
    db.participant.findMany({
      where: { editionId: edition.id },
      select: { id: true, email: true, registeredAt: true, attendedAt: true, registrationSource: true, ambassadorId: true },
    }),
    db.cigibmTask.findMany({ where: { editionNumber }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.ambassador.findMany({ where: { active: true }, select: { id: true, fullName: true, photoUrl: true } }),
    db.lead.count({ where: { contactedAt: null } }),
    db.lead.count({ where: { contactedAt: null, needsHelp: true } }),
    db.resource.findMany({
      where: { editionNumber },
      select: { id: true, title: true, kind: true, fileName: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Messages de l'édition : les envois groupés dont au moins un destinataire est inscrit à cette édition.
  const participantIds = participants.map((p) => p.id);
  const logs = participantIds.length
    ? await db.messagingLog.findMany({
        where: { participantId: { in: participantIds }, batchId: { not: null } },
        select: { batchId: true, batchLabel: true, channel: true, status: true, sentAt: true },
        orderBy: { sentAt: "desc" },
      })
    : [];
  const batches = new Map<string, { label: string; channel: string; sentAt: Date; sent: number; failed: number }>();
  for (const l of logs) {
    const b = batches.get(l.batchId!) ?? { label: l.batchLabel ?? "(sans nom)", channel: l.channel, sentAt: l.sentAt, sent: 0, failed: 0 };
    if (l.status === "sent") b.sent += 1;
    if (l.status === "failed") b.failed += 1;
    batches.set(l.batchId!, b);
  }

  const attended = participants.filter((p) => p.attendedAt);
  const noShows = participants.filter((p) => !p.attendedAt);
  const bySource = { form: 0, qr_walkin: 0, admin_manual: 0 };
  for (const p of participants) bySource[p.registrationSource] += 1;

  const referred = new Map<string, { referred: number; attended: number }>();
  for (const p of participants) {
    if (!p.ambassadorId) continue;
    const r = referred.get(p.ambassadorId) ?? { referred: 0, attended: 0 };
    r.referred += 1;
    if (p.attendedAt) r.attended += 1;
    referred.set(p.ambassadorId, r);
  }
  const ambassadorRanking = ambassadors
    .map((a) => ({ ...a, ...(referred.get(a.id) ?? { referred: 0, attended: 0 }) }))
    .sort((a, b) => b.referred - a.referred || b.attended - a.attended);
  const viaAmbassadors = participants.filter((p) => p.ambassadorId).length;

  const today = beninDayNumber(now);
  const overdue = tasks.filter((t) => t.status !== "done" && t.dueDate && beninDayNumber(t.dueDate) < today);
  const tasksDone = tasks.filter((t) => t.status === "done").length;

  const insights = buildInsights({
    editionNumber,
    eventDate: edition.eventDate,
    now,
    participants: participants.length,
    attended: attended.length,
    noShows: noShows.length,
    noShowsWithEmail: noShows.filter((p) => p.email).length,
    ambassadorsActive: ambassadors.length,
    ambassadorsWithoutReferral: ambassadorRanking.filter((a) => a.referred === 0).length,
    tasksTotal: tasks.length,
    tasksDone,
    tasksOverdue: overdue.length,
    leadsToContact,
    leadsNeedingHelp,
  });

  return {
    edition,
    phase: editionPhase(edition.eventDate, now),
    stats: {
      participants: participants.length,
      attended: attended.length,
      noShows: noShows.length,
      noShowsWithEmail: noShows.filter((p) => p.email).length,
      withEmail: participants.filter((p) => p.email).length,
      viaAmbassadors,
      bySource,
      attendanceRate: participants.length ? Math.round((attended.length / participants.length) * 100) : 0,
    },
    registrationsByDay: bucketByDay(participants.map((p) => p.registeredAt)),
    attendanceByDay: bucketByDay(attended.map((p) => p.attendedAt!)),
    ambassadorRanking,
    tasks,
    tasksDone,
    overdueIds: new Set(overdue.map((t) => t.id)),
    insights,
    resources,
    batches: [...batches.entries()].map(([id, b]) => ({ id, ...b })),
  };
}

// ---- Éditions ----

export async function createEdition(input: EditionInput) {
  const exists = await db.edition.findUnique({ where: { number: input.number } });
  if (exists) return { ok: false as const, error: `L'édition ${input.number} existe déjà.` };
  // hasParticipantData : une nouvelle édition est gérée par la plateforme (inscriptions, scan).
  await db.edition.create({ data: { ...input, hasParticipantData: true } });
  return { ok: true as const };
}

export async function updateEdition(number: number, input: Omit<EditionInput, "number">) {
  await db.edition.update({ where: { number }, data: input });
}

// ---- Checklist ----

export async function generateChecklist(editionNumber: number) {
  const [edition, count] = await Promise.all([
    db.edition.findUniqueOrThrow({ where: { number: editionNumber } }),
    db.cigibmTask.count({ where: { editionNumber } }),
  ]);
  if (count > 0) return 0; // jamais de doublons : la checklist n'est générée qu'une fois
  const rows = buildChecklist(edition.eventDate).map((t) => ({ ...t, editionNumber }));
  const res = await db.cigibmTask.createMany({ data: rows });
  return res.count;
}

export async function createTask(editionNumber: number, input: TaskInput) {
  const last = await db.cigibmTask.findFirst({ where: { editionNumber }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  return db.cigibmTask.create({ data: { ...input, editionNumber, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export async function updateTask(id: string, input: TaskInput) {
  return db.cigibmTask.update({ where: { id }, data: input });
}

export async function setTaskStatus(id: string, status: TaskStatusKey) {
  return db.cigibmTask.update({ where: { id }, data: { status } });
}

export async function getTask(id: string) {
  return db.cigibmTask.findUnique({ where: { id } });
}

export async function deleteTask(id: string) {
  await db.cigibmTask.deleteMany({ where: { id } });
}
