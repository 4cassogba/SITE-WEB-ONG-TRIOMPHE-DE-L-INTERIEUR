"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { reactivateTeamMember, removeTeamMember, suspendTeamMember, TeamActionError } from "@/lib/admin/team";

export type TeamActionResult = { error?: string };

async function run(action: (actorId: string) => Promise<void>): Promise<TeamActionResult> {
  const session = await requireAdmin();
  try {
    await action(session.id);
  } catch (err) {
    if (err instanceof TeamActionError) return { error: err.message };
    console.error("Team member action failed", err);
    return { error: "L'opération a échoué. Vérifiez la connexion et réessayez." };
  }
  revalidatePath("/admin/team");
  return {};
}

export async function suspendTeamMemberAction(id: string) {
  return run((actorId) => suspendTeamMember(id, actorId));
}

export async function reactivateTeamMemberAction(id: string) {
  return run((actorId) => reactivateTeamMember(id, actorId));
}

export async function removeTeamMemberAction(id: string) {
  return run((actorId) => removeTeamMember(id, actorId));
}
