"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createEdition,
  createTask,
  deleteTask,
  generateChecklist,
  getTask,
  setTaskStatus,
  updateEdition,
  updateTask,
} from "@/lib/admin/cigibm";
import { CIGIBM_SPACE, cigibmHref, nextStatus, validateEditionForm, validateTaskForm, type CigibmTab } from "@/lib/cigibm-hub";

export type FormState = { error?: string; values?: Record<string, string> } | null;

function submittedValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function refresh() {
  revalidatePath(CIGIBM_SPACE);
  revalidatePath("/admin/evenements");
  revalidatePath("/admin");
}

const hub = (n: number, tab?: CigibmTab) => cigibmHref(n, tab);

export async function createEditionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const checked = validateEditionForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  const res = await createEdition(checked.value);
  if (!res.ok) return { error: res.error, values: submittedValues(formData) };
  refresh();
  redirect(hub(checked.value.number));
}

export async function updateEditionAction(number: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  formData.set("number", String(number)); // le numéro d'une édition existante ne change pas
  const checked = validateEditionForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  const { theme, dates, venue, eventDate } = checked.value;
  await updateEdition(number, { theme, dates, venue, eventDate });
  refresh();
  redirect(hub(number));
}

export async function generateChecklistAction(editionNumber: number) {
  await requireAdmin();
  await generateChecklist(editionNumber);
  refresh();
}

export async function cycleTaskStatusAction(id: string) {
  await requireAdmin();
  const task = await getTask(id);
  if (!task) return;
  await setTaskStatus(id, nextStatus(task.status));
  refresh();
}

export async function createTaskAction(editionNumber: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const checked = validateTaskForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  await createTask(editionNumber, checked.value);
  refresh();
  return null;
}

export async function updateTaskAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const checked = validateTaskForm(formData);
  if (!checked.ok) return { error: checked.error, values: submittedValues(formData) };
  const task = await updateTask(id, checked.value);
  refresh();
  redirect(hub(task.editionNumber, "preparation"));
}

export async function deleteTaskAction(id: string) {
  await requireAdmin();
  const task = await getTask(id);
  await deleteTask(id);
  refresh();
  if (task) redirect(hub(task.editionNumber, "preparation"));
}
