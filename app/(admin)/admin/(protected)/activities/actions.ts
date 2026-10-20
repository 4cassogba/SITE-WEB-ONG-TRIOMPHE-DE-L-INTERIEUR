"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createActivity,
  deleteActivity,
  setActivityPublished,
  updateActivity,
  validateActivityForm,
} from "@/lib/admin/activities";

// `values` : ce que la personne avait saisi. React remet un formulaire à zéro après
// chaque envoi ; sans ça, une erreur de validation effacerait tous les champs.
export type ActivityFormState = { error?: string; values?: Record<string, string> } | null;

function submittedValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function refresh() {
  revalidatePath("/admin/activities");
  revalidatePath("/activites");
}

export async function createActivityAction(_prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  await requireAdmin();
  const checked = validateActivityForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  await createActivity(checked.value);
  refresh();
  redirect("/admin/activities");
}

export async function updateActivityAction(id: string, _prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  await requireAdmin();
  const checked = validateActivityForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  await updateActivity(id, checked.value);
  refresh();
  redirect("/admin/activities");
}

export async function setPublishedAction(id: string, published: boolean) {
  await requireAdmin();
  await setActivityPublished(id, published);
  refresh();
}

export async function deleteActivityAction(id: string) {
  await requireAdmin();
  await deleteActivity(id);
  refresh();
  redirect("/admin/activities");
}
