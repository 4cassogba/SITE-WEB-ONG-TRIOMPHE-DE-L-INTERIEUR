"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { setLeadContacted } from "@/lib/admin/leads";

export async function setLeadContactedAction(id: string, contacted: boolean) {
  await requireAdmin();
  await setLeadContacted(id, contacted);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
