import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export type TeamMember = {
  id: string;
  fullName: string;
  role: "admin" | "scanner";
  createdAt: Date;
};

export async function listTeamMembers(): Promise<TeamMember[]> {
  return db.adminProfile.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, role: true, createdAt: true },
  });
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
