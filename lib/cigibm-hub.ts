// Logique pure de l'espace CIGIBM (menu Événements, /admin/evenements/cigibm) : libellés, checklist type,
// échéances, calendrier de communication et alertes. Aucun accès base ici,
// pour rester testable.

// ---- Adresses de l'espace CIGIBM ----

export const CIGIBM_SPACE = "/admin/evenements/cigibm";
export const CIGIBM_TABS = ["apercu", "preparation", "participants", "scanner", "ambassadeurs", "communication", "documents"] as const;
export type CigibmTab = (typeof CIGIBM_TABS)[number];

export function cigibmHref(edition?: number | null, tab?: CigibmTab): string {
  const q = new URLSearchParams();
  if (edition) q.set("edition", String(edition));
  if (tab && tab !== "apercu") q.set("tab", tab);
  const query = q.toString();
  return query ? `${CIGIBM_SPACE}?${query}` : CIGIBM_SPACE;
}

export const TASK_CATEGORIES = ["programme", "logistique", "communication", "partenaires", "finances", "bilan"] as const;
export type TaskCategoryKey = (typeof TASK_CATEGORIES)[number];
export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export type TaskStatusKey = (typeof TASK_STATUSES)[number];

export const TASK_CATEGORY_LABELS: Record<TaskCategoryKey, string> = {
  programme: "Programme",
  logistique: "Logistique et accueil",
  communication: "Communication",
  partenaires: "Partenaires",
  finances: "Finances",
  bilan: "Bilan et suites",
};

export const TASK_STATUS_LABELS: Record<TaskStatusKey, string> = { todo: "À faire", doing: "En cours", done: "Fait" };

export function nextStatus(status: TaskStatusKey): TaskStatusKey {
  return status === "todo" ? "doing" : status === "doing" ? "done" : "todo";
}

// ---- Dates (heure de Cotonou, UTC+1 toute l'année) ----

const DAY_MS = 24 * 60 * 60 * 1000;
const BENIN_OFFSET_MS = 60 * 60 * 1000;

// Numéro du jour calendaire à Cotonou : deux instants du même jour local donnent le même numéro.
export function beninDayNumber(d: Date): number {
  return Math.floor((d.getTime() + BENIN_OFFSET_MS) / DAY_MS);
}

// Jours restants jusqu'à `target` (négatif si passé) vu de `now`.
export function daysUntil(target: Date, now: Date): number {
  return beninDayNumber(target) - beninDayNumber(now);
}

export function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

// 'YYYY-MM-DD' → midi UTC de ce jour (reste le même jour à Cotonou).
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInput(d: Date | null | undefined): string {
  return d ? new Date(d.getTime() + BENIN_OFFSET_MS).toISOString().slice(0, 10) : "";
}

export type EditionPhase = { kind: "undated" } | { kind: "upcoming"; days: number } | { kind: "today" } | { kind: "past"; days: number };

export function editionPhase(eventDate: Date | null, now: Date): EditionPhase {
  if (!eventDate) return { kind: "undated" };
  const days = daysUntil(eventDate, now);
  if (days > 0) return { kind: "upcoming", days };
  if (days === 0) return { kind: "today" };
  return { kind: "past", days: -days };
}

export function phaseLabel(phase: EditionPhase): string {
  switch (phase.kind) {
    case "undated": return "Date à définir";
    case "today": return "C'est aujourd'hui";
    case "upcoming": return phase.days === 1 ? "Demain" : `J-${phase.days}`;
    // Au-delà de 45 jours, le décompte n'apporte plus rien : les dates sont affichées à côté.
    case "past": return phase.days === 1 ? "Terminée hier" : phase.days > 45 ? "Terminée" : `Terminée il y a ${phase.days} jours`;
  }
}

// Une édition passée n'a plus de préparation : l'onglet et les alertes disparaissent.
export function hasPreparation(phase: EditionPhase): boolean {
  return phase.kind !== "past";
}

// Une édition terminée est archivée : ses informations ne se modifient plus.
export function isEditionLocked(phase: EditionPhase): boolean {
  return phase.kind === "past";
}

export function tabsFor(phase: EditionPhase): CigibmTab[] {
  return CIGIBM_TABS.filter((t) => t !== "preparation" || hasPreparation(phase));
}

// ---- Checklist type ----

// Échéances relatives au jour de l'édition (J-150 = 150 jours avant). Ce sont
// des repères de bonne pratique, pas des faits : tout est modifiable ensuite.
type TemplateTask = { title: string; category: TaskCategoryKey; offsetDays: number };

export const CHECKLIST_TEMPLATE: TemplateTask[] = [
  { category: "programme", offsetDays: -150, title: "Fixer le thème de l'édition et sa promesse" },
  { category: "programme", offsetDays: -145, title: "Relier le thème aux trois axes de l'ONG (humanitaire, bien-être mental, autonomisation)" },
  { category: "programme", offsetDays: -110, title: "Construire le programme heure par heure" },
  { category: "programme", offsetDays: -90, title: "Confirmer les intervenants et modérateurs" },
  { category: "programme", offsetDays: -30, title: "Valider le déroulé et les temps de parole" },
  { category: "programme", offsetDays: -3, title: "Répétition générale" },

  { category: "logistique", offsetDays: -150, title: "Réserver et confirmer la salle" },
  { category: "logistique", offsetDays: -60, title: "Prévoir le son, la vidéo et la captation" },
  { category: "logistique", offsetDays: -30, title: "Organiser l'accueil : hôtesses, badges, signalétique" },
  { category: "logistique", offsetDays: -14, title: "Préparer le scan QR et former l'équipe d'entrée" },
  { category: "logistique", offsetDays: -14, title: "Prévoir un référent bien-être sur place pour accompagner une personne en détresse" },

  { category: "communication", offsetDays: -100, title: "Visuel officiel et page CIGIBM à jour" },
  { category: "communication", offsetDays: -90, title: "Ouvrir les inscriptions" },
  { category: "communication", offsetDays: -60, title: "Briefer les ambassadeurs et leur donner leurs liens" },
  { category: "communication", offsetDays: -45, title: "Conférence ou communiqué de presse" },
  { category: "communication", offsetDays: -7, title: "Rappel aux inscrits (email et WhatsApp)" },
  { category: "communication", offsetDays: -1, title: "Rappel de la veille avec badge et lieu" },
  { category: "communication", offsetDays: 0, title: "Couverture photo et vidéo du jour" },

  { category: "partenaires", offsetDays: -140, title: "Lister les partenaires et sponsors visés" },
  { category: "partenaires", offsetDays: -120, title: "Préparer le dossier de partenariat" },
  { category: "partenaires", offsetDays: -60, title: "Relancer les partenaires" },
  { category: "partenaires", offsetDays: -30, title: "Obtenir les accords écrits" },

  { category: "finances", offsetDays: -150, title: "Valider le budget prévisionnel" },
  { category: "finances", offsetDays: -90, title: "Mobiliser les fonds et ouvrir les dons" },
  { category: "finances", offsetDays: 14, title: "Arrêter les comptes de l'édition" },

  { category: "bilan", offsetDays: 1, title: "Relever la présence réelle de chaque jour" },
  { category: "bilan", offsetDays: 3, title: "Recueillir témoignages et retours des participants" },
  { category: "bilan", offsetDays: 3, title: "Remercier participants, ambassadeurs et partenaires" },
  { category: "bilan", offsetDays: 7, title: "Proposer aux participants un atelier, la communauté GTI ou un accompagnement" },
  { category: "bilan", offsetDays: 14, title: "Publier le bilan avec des chiffres vérifiés" },
  { category: "bilan", offsetDays: 10, title: "Retour d'expérience de l'équipe" },
];

export function buildChecklist(eventDate: Date | null) {
  return CHECKLIST_TEMPLATE.map((t, i) => ({
    title: t.title,
    category: t.category,
    dueDate: eventDate ? addDays(eventDate, t.offsetDays) : null,
    sortOrder: i,
  }));
}

// Quand le jour principal d'une édition est fixé ou déplacé, les étapes de la
// checklist type suivent : une échéance vide ou encore calée sur l'ancienne date
// est recalculée. Une échéance modifiée à la main n'est jamais touchée.
export function rescheduleChecklist(
  tasks: { id: string; title: string; dueDate: Date | null }[],
  oldDate: Date | null,
  newDate: Date | null,
): { id: string; dueDate: Date | null }[] {
  if (!newDate || (oldDate && oldDate.getTime() === newDate.getTime())) return [];
  const offsets = new Map(CHECKLIST_TEMPLATE.map((t) => [t.title, t.offsetDays]));
  const out: { id: string; dueDate: Date | null }[] = [];
  for (const task of tasks) {
    const offset = offsets.get(task.title);
    if (offset === undefined) continue;
    const followsOld = oldDate !== null && task.dueDate !== null && task.dueDate.getTime() === addDays(oldDate, offset).getTime();
    if (task.dueDate === null || followsOld) out.push({ id: task.id, dueDate: addDays(newDate, offset) });
  }
  return out;
}

// ---- Calendrier de communication recommandé ----

export type CommsStep = { offsetDays: number; label: string; detail: string };

export const COMMS_STEPS: CommsStep[] = [
  { offsetDays: -90, label: "Ouverture des inscriptions", detail: "Annonce, page CIGIBM, lien des ambassadeurs." },
  { offsetDays: -45, label: "Presse et partenaires", detail: "Communiqué ou conférence de presse, partenaires cités avec accord." },
  { offsetDays: -30, label: "Relance des ambassadeurs", detail: "Point d'étape, classement, messages prêts à envoyer." },
  { offsetDays: -7, label: "Rappel aux inscrits", detail: "Email et WhatsApp : date, lieu, badge." },
  { offsetDays: -1, label: "Rappel de la veille", detail: "Heure d'ouverture, accès, badge QR." },
  { offsetDays: 1, label: "Merci et premières photos", detail: "Remerciement aux participants et aux équipes." },
  { offsetDays: 7, label: "Relance des absents et suite", detail: "Inscrits non présents : replay, atelier, GTI, accompagnement." },
  { offsetDays: 14, label: "Publication du bilan", detail: "Article et chiffres vérifiés, relayés aux ambassadeurs et à la presse." },
];

// ---- Alertes intelligentes ----

export type Insight = { level: "alert" | "info" | "good"; title: string; detail: string; href?: string; cta?: string };

export type InsightInput = {
  editionNumber: number;
  eventDate: Date | null;
  now: Date;
  participants: number;
  attended: number;
  noShows: number;
  noShowsWithEmail: number;
  ambassadorsActive: number;
  ambassadorsWithoutReferral: number;
  tasksTotal: number;
  tasksDone: number;
  tasksOverdue: number;
  leadsToContact: number;
  leadsNeedingHelp: number;
};

export function buildInsights(i: InsightInput): Insight[] {
  const out: Insight[] = [];
  const phase = editionPhase(i.eventDate, i.now);

  if (phase.kind === "undated") {
    out.push({ level: "alert", title: "Date de l'édition non définie", detail: "Sans date, pas de compte à rebours ni d'échéances automatiques.", href: `${CIGIBM_SPACE}/editions/${i.editionNumber}/edit`, cta: "Définir la date" });
  }
  // La préparation ne concerne qu'une édition à venir : rien à préparer pour une édition passée.
  if (hasPreparation(phase) && i.tasksTotal === 0) {
    out.push({ level: "info", title: "Aucune checklist de préparation", detail: "Générez la checklist type (une trentaine d'étapes avec échéances), puis ajustez-la.", href: cigibmHref(i.editionNumber, "preparation"), cta: "Ouvrir la préparation" });
  }
  if (hasPreparation(phase) && i.tasksOverdue > 0) {
    out.push({ level: "alert", title: `${i.tasksOverdue} tâche${i.tasksOverdue > 1 ? "s" : ""} en retard`, detail: "Des étapes de préparation ont dépassé leur échéance.", href: cigibmHref(i.editionNumber, "preparation"), cta: "Voir les retards" });
  }
  if (phase.kind === "past" && i.noShows > 0) {
    out.push({
      level: "alert",
      title: `${i.noShows} inscrit${i.noShows > 1 ? "s" : ""} non présent${i.noShows > 1 ? "s" : ""}`,
      detail: i.noShowsWithEmail > 0 ? `${i.noShowsWithEmail} ont un email : relance possible avec le replay, un atelier ou la communauté GTI.` : "Aucun n'a d'email : relance par téléphone ou WhatsApp.",
      href: "/admin/messages/new",
      cta: "Écrire aux absents",
    });
  }
  if (phase.kind === "upcoming" && phase.days <= 14 && i.participants === 0) {
    out.push({ level: "alert", title: "Aucun inscrit à moins de 15 jours", detail: "Relancez les ambassadeurs et la communication.", href: cigibmHref(i.editionNumber, "ambassadeurs"), cta: "Voir les ambassadeurs" });
  }
  if (phase.kind === "upcoming" && i.ambassadorsWithoutReferral > 0 && i.ambassadorsActive > 0) {
    out.push({ level: "info", title: `${i.ambassadorsWithoutReferral} ambassadeur${i.ambassadorsWithoutReferral > 1 ? "s" : ""} sans aucun inscrit`, detail: `Sur ${i.ambassadorsActive} actifs : un message de relance leur donnerait de l'élan.`, href: cigibmHref(i.editionNumber, "ambassadeurs"), cta: "Voir les ambassadeurs" });
  }
  if (i.leadsToContact > 0) {
    out.push({ level: i.leadsNeedingHelp > 0 ? "alert" : "info", title: `${i.leadsToContact} contact${i.leadsToContact > 1 ? "s" : ""} à rappeler`, detail: i.leadsNeedingHelp > 0 ? `Dont ${i.leadsNeedingHelp} qui demande${i.leadsNeedingHelp > 1 ? "nt" : ""} de l'aide : à traiter en priorité.` : "Ils ont laissé leurs coordonnées via le pop-up.", href: "/admin/leads", cta: "Ouvrir les contacts" });
  }
  if (phase.kind === "past" && i.participants > 0 && i.attended === 0) {
    out.push({ level: "info", title: "Aucune présence enregistrée", detail: "Si le scan n'a pas été utilisé, le bilan de présence reste à reconstituer.", href: cigibmHref(i.editionNumber, "participants"), cta: "Voir les participants" });
  }
  if (i.tasksTotal > 0 && i.tasksDone === i.tasksTotal) {
    out.push({ level: "good", title: "Checklist terminée", detail: "Toutes les étapes de préparation sont faites." });
  }
  if (out.length === 0) out.push({ level: "good", title: "Rien d'urgent", detail: "Aucune alerte pour cette édition." });
  return out;
}

// ---- Inscriptions par jour (pour la courbe) ----

export function bucketByDay(dates: Date[]): { day: number; label: string; count: number }[] {
  if (dates.length === 0) return [];
  const counts = new Map<number, number>();
  for (const d of dates) counts.set(beninDayNumber(d), (counts.get(beninDayNumber(d)) ?? 0) + 1);
  const days = [...counts.keys()];
  const min = Math.min(...days);
  const max = Math.max(...days);
  const out: { day: number; label: string; count: number }[] = [];
  for (let day = min; day <= max; day++) {
    const label = new Date(day * DAY_MS).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
    out.push({ day, label, count: counts.get(day) ?? 0 });
  }
  return out;
}

// ---- Validation des formulaires ----

type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

export type TaskInput = { title: string; category: TaskCategoryKey; dueDate: Date | null; owner: string | null; notes: string | null };

export function validateTaskForm(form: FormData): Checked<TaskInput> {
  const title = String(form.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 160) return { ok: false, error: "Le titre doit faire entre 3 et 160 caractères." };
  const category = String(form.get("category") ?? "") as TaskCategoryKey;
  if (!TASK_CATEGORIES.includes(category)) return { ok: false, error: "Choisissez une catégorie." };
  const rawDue = String(form.get("dueDate") ?? "").trim();
  let dueDate: Date | null = null;
  if (rawDue) {
    dueDate = parseDateInput(rawDue);
    if (!dueDate) return { ok: false, error: "Date d'échéance invalide." };
  }
  const owner = String(form.get("owner") ?? "").trim().slice(0, 80) || null;
  const notes = String(form.get("notes") ?? "").trim().slice(0, 1000) || null;
  return { ok: true, value: { title, category, dueDate, owner, notes } };
}

export type EditionInput = { number: number; theme: string; dates: string; venue: string; eventDate: Date | null };

export function validateEditionForm(form: FormData): Checked<EditionInput> {
  const number = Number(String(form.get("number") ?? "").trim());
  if (!Number.isInteger(number) || number < 1 || number > 99) return { ok: false, error: "Numéro d'édition invalide." };
  const theme = String(form.get("theme") ?? "").trim();
  if (theme.length < 2 || theme.length > 120) return { ok: false, error: "Le thème doit faire entre 2 et 120 caractères." };
  const dates = String(form.get("dates") ?? "").trim();
  if (dates.length < 2 || dates.length > 80) return { ok: false, error: "Les dates (texte affiché) doivent faire entre 2 et 80 caractères." };
  const venue = String(form.get("venue") ?? "").trim();
  if (venue.length < 2 || venue.length > 120) return { ok: false, error: "Le lieu doit faire entre 2 et 120 caractères." };
  const rawDate = String(form.get("eventDate") ?? "").trim();
  let eventDate: Date | null = null;
  if (rawDate) {
    eventDate = parseDateInput(rawDate);
    if (!eventDate) return { ok: false, error: "Date du jour principal invalide." };
  }
  return { ok: true, value: { number, theme, dates, venue, eventDate } };
}
