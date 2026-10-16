import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export type CheckInResult =
  | { status: "not_found" }
  | { status: "already"; fullName: string; attendedAt: Date }
  | { status: "success"; fullName: string }
  | { status: "registered"; fullName: string }
  | { status: "invalid"; message: string };

// Never carries attendanceToken — it's a bearer credential (whoever holds it
// can check the participant in), and the door search has no need to send it
// to the browser.
export type ParticipantMatch = {
  id: string;
  fullName: string;
  phone: string;
  attendedAt: Date | null;
};

type AttendanceState = { id: string; fullName: string; attendedAt: Date | null };

// A near-simultaneous double-scan of the same participant (two scanners, same
// visitor — whether found by QR token or by search) can both pass the
// `!participant.attendedAt` check before either writes — an accepted,
// low-stakes race: worst case is the door briefly shows "success" twice for
// one person, never a duplicate row or a lost check-in, so no locking is
// added for it. Within that race window, the second write still lands:
// `checkedInByAdminId` and `attendedAt` end up reflecting whichever of the
// two updates completes last, silently overwriting the first scanner's
// credit.
async function markAttended(participant: AttendanceState, scannerAdminId: string): Promise<CheckInResult> {
  if (participant.attendedAt) {
    return { status: "already", fullName: participant.fullName, attendedAt: participant.attendedAt };
  }

  const updated = await db.participant.update({
    where: { id: participant.id },
    data: { attendedAt: new Date(), checkedInByAdminId: scannerAdminId },
  });

  return { status: "success", fullName: updated.fullName };
}

export async function checkInParticipant(token: string, scannerAdminId: string): Promise<CheckInResult> {
  const participant = await db.participant.findUnique({ where: { attendanceToken: token } });
  if (!participant) return { status: "not_found" };
  return markAttended(participant, scannerAdminId);
}

// Same semantics as checkInParticipant, keyed on the participant's id instead
// of their token — what the manual search fallback calls once staff pick a
// person from the results (bad lighting / camera failure at the door).
export async function checkInParticipantById(id: string, scannerAdminId: string): Promise<CheckInResult> {
  const participant = await db.participant.findUnique({ where: { id } });
  if (!participant) return { status: "not_found" };
  return markAttended(participant, scannerAdminId);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Personne venue sans inscription (ou introuvable dans la liste) : l'hôtesse
// l'inscrit et la marque présente en une seule action. Seul le nom est
// obligatoire — au guichet, ralentir la file pour un email manquant coûte
// plus cher qu'une fiche incomplète. Phone vaut "" quand il n'est pas donné
// (la colonne est non nullable).
//
// Jamais de doublon : un email déjà inscrit, ou un même nom + téléphone,
// renvoie vers la fiche existante (check-in normal) au lieu d'en créer une
// seconde — même règle « deux identifiants sur trois » que l'inscription
// publique, ici en version minimale.
export async function registerWalkIn(
  input: { fullName: string; phone?: string; email?: string },
  scannerAdminId: string
): Promise<CheckInResult> {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const email = input.email?.trim() || undefined;
  const phoneRaw = input.phone?.trim();
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";

  if (fullName.length < 2) return { status: "invalid", message: "Le nom est obligatoire." };
  if (email && !EMAIL_PATTERN.test(email)) return { status: "invalid", message: "Cet email ne semble pas valide." };

  const edition4 = await db.edition.findUnique({ where: { number: 4 } });
  if (!edition4) return { status: "invalid", message: "Édition introuvable." };

  const duplicate = await db.participant.findFirst({
    where: {
      editionId: edition4.id,
      OR: [
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
        ...(phone ? [{ phone, fullName: { equals: fullName, mode: "insensitive" as const } }] : []),
      ],
    },
  });
  if (duplicate) return markAttended(duplicate, scannerAdminId);

  const created = await db.participant.create({
    data: {
      editionId: edition4.id,
      fullName,
      phone,
      email: email ?? null,
      registrationSource: "qr_walkin",
      attendedAt: new Date(),
      checkedInByAdminId: scannerAdminId,
    },
  });
  return { status: "registered", fullName: created.fullName };
}

// Manual door fallback: search by name or phone when the camera can't read a
// badge. Scoped to édition 4 (the event being scanned) — mirrors the
// resolution pattern used for the anti-duplicate check in
// app/api/cigibm-register/route.ts.
export async function searchParticipants(query: string): Promise<ParticipantMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const edition4 = await db.edition.findUnique({ where: { number: 4 } });
  if (!edition4) return [];

  return db.participant.findMany({
    where: {
      editionId: edition4.id,
      OR: [
        // Phone numbers are stored normalised as +229XXXXXXXX. A staffer
        // typing the local form (e.g. "0100000010") still matches
        // "+2290100000010" via a plain `contains` — the local form is exactly
        // the +229-prefixed string's suffix, no extra normalisation needed.
        { fullName: { contains: trimmed, mode: "insensitive" } },
        { phone: { contains: trimmed } },
      ],
    },
    orderBy: { fullName: "asc" },
    take: 10,
    select: { id: true, fullName: true, phone: true, attendedAt: true },
  });
}
