import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export type TeamMember = {
  id: string;
  fullName: string;
  role: "admin" | "scanner";
  createdAt: Date;
  suspendedAt: Date | null;
  // Email de connexion, lu côté Supabase Auth (AdminProfile n'en a pas) :
  // permet de distinguer deux homonymes avant de suspendre ou retirer.
  email: string | null;
};

export async function listTeamMembers(): Promise<TeamMember[]> {
  const [profiles, emailsById] = await Promise.all([
    db.adminProfile.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, fullName: true, role: true, createdAt: true, suspendedAt: true },
    }),
    loadAuthEmails(),
  ]);
  return profiles.map((p) => ({ ...p, email: emailsById.get(p.id) ?? null }));
}

// Best-effort : si Supabase ne répond pas, la liste s'affiche quand même,
// simplement sans les emails.
async function loadAuthEmails(): Promise<Map<string, string>> {
  try {
    const { data, error } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    return new Map(data.users.filter((u) => u.email).map((u) => [u.id, u.email!]));
  } catch (err) {
    console.error("Loading team emails from Supabase failed", err);
    return new Map();
  }
}

export class TeamActionError extends Error {}

function assertNotSelf(targetId: string, actorId: string) {
  if (targetId === actorId) throw new TeamActionError("Vous ne pouvez pas modifier votre propre accès.");
}

// ~100 ans : Supabase n'a pas de ban "permanent", seulement une durée.
const SUSPENSION_BAN_DURATION = "876000h";

// Le drapeau en base coupe l'accès immédiatement (même session ouverte) ; le
// ban Supabase empêche en plus toute nouvelle connexion. Le drapeau est posé
// d'abord : si le ban échoue, l'accès reste quand même coupé.
export async function suspendTeamMember(targetId: string, actorId: string): Promise<void> {
  assertNotSelf(targetId, actorId);
  await db.adminProfile.update({ where: { id: targetId }, data: { suspendedAt: new Date() } });
  const { error } = await createAdminClient().auth.admin.updateUserById(targetId, {
    ban_duration: SUSPENSION_BAN_DURATION,
  });
  if (error) console.error("Supabase ban failed after suspending team member", targetId, error);
}

// Ordre inverse de la suspension : on lève le ban d'abord, pour ne jamais
// afficher un compte "actif" qui ne pourrait en réalité pas se connecter.
export async function reactivateTeamMember(targetId: string, actorId: string): Promise<void> {
  assertNotSelf(targetId, actorId);
  const { error } = await createAdminClient().auth.admin.updateUserById(targetId, { ban_duration: "none" });
  if (error) throw error;
  await db.adminProfile.update({ where: { id: targetId }, data: { suspendedAt: null } });
}

// Supprime le compte de connexion puis la fiche. Rejouable : si une première
// tentative a supprimé le compte Supabase mais pas la fiche, la suivante
// ignore "utilisateur introuvable" et termine le travail. L'historique des
// check-ins (Participant.checkedInByAdminId) est conservé tel quel.
export async function removeTeamMember(targetId: string, actorId: string): Promise<void> {
  assertNotSelf(targetId, actorId);
  const { error } = await createAdminClient().auth.admin.deleteUser(targetId);
  if (error && error.status !== 404 && error.code !== "user_not_found") throw error;
  await db.adminProfile.deleteMany({ where: { id: targetId } });
}

export type UpsertTeamMemberInput = {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "scanner";
};

export type UpsertTeamMemberResult =
  | { status: "created"; id: string }
  | { status: "attributed"; id: string }
  | { status: "unchanged"; id: string };

type AdminClient = ReturnType<typeof createAdminClient>;

// GoTrue's documented code for createUser() on an email that's already
// registered. Message is checked too as a fallback — this exact string
// isn't something this codebase can verify against the real API outside
// production, so a brittle code-only match risks silently falling through
// to the generic `throw error` below instead of the intended attribution
// path.
function isDuplicateEmailError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "email_exists") return true;
  return /already.*registered/i.test(error.message ?? "");
}

async function findAuthUserByEmail(supabase: AdminClient, email: string) {
  // No direct "get user by email" in this SDK version — the team is small
  // enough (a handful of admins/hostesses) that paging through everyone and
  // filtering client-side is simpler than it's worth optimizing.
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

// Creates a new Supabase Auth account for this email and gives it an
// AdminProfile row — or, if an account with that email already exists
// (e.g. set up earlier for another purpose), attributes the chosen
// admin/scanner role directly to it instead of failing. Never touches the
// password of an existing account.
export async function upsertTeamMember(input: UpsertTeamMemberInput): Promise<UpsertTeamMemberResult> {
  const supabase = createAdminClient();
  const { fullName, email, password, role } = input;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId: string;
  let status: "created" | "attributed";

  if (!error) {
    userId = data.user!.id;
    status = "created";
  } else if (isDuplicateEmailError(error)) {
    const existing = await findAuthUserByEmail(supabase, email);
    if (!existing) throw error;
    userId = existing.id;
    status = "attributed";
  } else {
    throw error;
  }

  // Un compte déjà admin ne doit jamais être rétrogradé en scanner par ce
  // formulaire : saisir son propre email dans une liste d'hôtesses suffisait
  // à se retirer l'accès admin.
  if (status === "attributed" && role === "scanner") {
    const existingProfile = await db.adminProfile.findUnique({ where: { id: userId } });
    if (existingProfile?.role === "admin") return { status: "unchanged", id: userId };
  }

  await db.adminProfile.upsert({
    where: { id: userId },
    create: { id: userId, fullName, role },
    update: { fullName, role },
  });

  return { status, id: userId };
}
