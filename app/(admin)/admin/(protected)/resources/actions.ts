"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createNote,
  createUploadTarget,
  deleteResource,
  fileExists,
  getResource,
  registerFile,
  replaceFile,
  signedFileUrl,
  updateNote,
  updateResourceMeta,
  validateFileMeta,
  validateNoteBody,
  validateResourceMeta,
} from "@/lib/admin/resources";
import { fileKindLabel } from "@/lib/resources-meta";

export type NoteFormState = { error?: string; values?: Record<string, string> } | null;

function submittedValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function refresh(id?: string) {
  revalidatePath("/admin/resources");
  revalidatePath("/admin/evenements/cigibm");
  if (id) revalidatePath(`/admin/resources/${id}`);
}

export async function createNoteAction(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const admin = await requireAdmin();
  const meta = validateResourceMeta({ title: formData.get("title"), category: formData.get("category"), editionNumber: formData.get("editionNumber") });
  if (!meta.ok) return { error: meta.error, values: submittedValues(formData) };
  const body = validateNoteBody(formData.get("body"));
  if (!body.ok) return { error: body.error, values: submittedValues(formData) };
  const row = await createNote({ ...meta.value, body: body.value, byName: admin.fullName });
  refresh();
  redirect(`/admin/resources/${row.id}`);
}

export async function updateNoteAction(id: string, _prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const admin = await requireAdmin();
  const meta = validateResourceMeta({ title: formData.get("title"), category: formData.get("category"), editionNumber: formData.get("editionNumber") });
  if (!meta.ok) return { error: meta.error, values: submittedValues(formData) };
  const body = validateNoteBody(formData.get("body"));
  if (!body.ok) return { error: body.error, values: submittedValues(formData) };
  const existing = await getResource(id);
  if (!existing || existing.kind !== "note") return { error: "Note introuvable.", values: submittedValues(formData) };
  await updateNote(id, { ...meta.value, body: body.value, byName: admin.fullName });
  refresh(id);
  redirect(`/admin/resources/${id}`);
}

export async function updateFileMetaAction(id: string, _prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const admin = await requireAdmin();
  const meta = validateResourceMeta({ title: formData.get("title"), category: formData.get("category"), editionNumber: formData.get("editionNumber") });
  if (!meta.ok) return { error: meta.error, values: submittedValues(formData) };
  await updateResourceMeta(id, { ...meta.value, byName: admin.fullName });
  refresh(id);
  redirect(`/admin/resources/${id}`);
}

export async function deleteResourceAction(id: string) {
  await requireAdmin();
  await deleteResource(id);
  refresh();
  redirect("/admin/resources");
}

// ---- Envoi de fichier : préparer → envoi direct navigateur→stockage → enregistrer ----

export async function prepareUploadAction(fileName: string, size: number) {
  await requireAdmin();
  return createUploadTarget(fileName, size);
}

type FinishedUpload = { path: string; fileName: string; mimeType: string | null; size: number };

async function checkUpload(u: FinishedUpload): Promise<string | null> {
  const checked = validateFileMeta(u.fileName, u.size);
  if (!checked.ok) return checked.error;
  if (!(await fileExists(u.path))) return "L'envoi du fichier n'a pas abouti. Réessayez.";
  return null;
}

export async function registerUploadAction(
  upload: FinishedUpload,
  fields: { title: string; category: string; editionNumber: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const meta = validateResourceMeta(fields);
  if (!meta.ok) return meta;
  const problem = await checkUpload(upload);
  if (problem) return { ok: false, error: problem };
  const row = await registerFile({ ...meta.value, filePath: upload.path, fileName: upload.fileName, mimeType: upload.mimeType, sizeBytes: upload.size, byName: admin.fullName });
  refresh();
  return { ok: true, id: row.id };
}

export async function replaceUploadAction(
  id: string,
  upload: FinishedUpload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const existing = await getResource(id);
  if (!existing || existing.kind !== "file") return { ok: false, error: "Document introuvable." };
  const problem = await checkUpload(upload);
  if (problem) return { ok: false, error: problem };
  await replaceFile(id, { filePath: upload.path, fileName: upload.fileName, mimeType: upload.mimeType, sizeBytes: upload.size, byName: admin.fullName });
  refresh(id);
  return { ok: true };
}

// URL de lecture à la demande (visionneuse Office) : 15 minutes, car la
// visionneuse de Microsoft récupère le fichier de son côté.
export async function previewUrlAction(id: string): Promise<{ url: string; kind: string } | { error: string }> {
  await requireAdmin();
  const row = await getResource(id);
  if (!row?.filePath || !row.fileName) return { error: "Document introuvable." };
  const url = await signedFileUrl(row.filePath, { seconds: 15 * 60 });
  if (!url) return { error: "Impossible de générer l'aperçu." };
  return { url, kind: fileKindLabel(row.fileName) };
}
