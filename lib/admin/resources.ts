import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_BYTES,
  RESOURCE_CATEGORIES,
  extensionOf,
  safeStorageName,
  type ResourceCategoryKey,
} from "@/lib/resources-meta";

// Bucket privé : jamais d'URL publique. Un fichier ne sort que par une URL
// signée de courte durée, délivrée à un admin connecté.
export const RESOURCES_BUCKET = "ressources";

export type ResourceInput = {
  title: string;
  category: ResourceCategoryKey;
  editionNumber: number | null;
};

type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateResourceMeta(form: { title?: unknown; category?: unknown; editionNumber?: unknown }): Checked<ResourceInput> {
  const title = String(form.title ?? "").trim();
  if (title.length < 2 || title.length > 120) return { ok: false, error: "Le titre doit faire entre 2 et 120 caractères." };
  const category = String(form.category ?? "autre") as ResourceCategoryKey;
  if (!RESOURCE_CATEGORIES.includes(category)) return { ok: false, error: "Catégorie inconnue." };
  const rawEdition = String(form.editionNumber ?? "").trim();
  let editionNumber: number | null = null;
  if (rawEdition !== "") {
    editionNumber = Number(rawEdition);
    if (!Number.isInteger(editionNumber) || editionNumber < 1 || editionNumber > 99) return { ok: false, error: "Numéro d'édition invalide." };
  }
  return { ok: true, value: { title, category, editionNumber } };
}

export function validateNoteBody(body: unknown): Checked<string> {
  const text = String(body ?? "");
  if (text.length > 200_000) return { ok: false, error: "Le texte est trop long (200 000 caractères maximum)." };
  return { ok: true, value: text };
}

export function validateFileMeta(name: string, size: number): Checked<{ ext: string }> {
  const ext = extensionOf(name);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, error: `Format non accepté (.${ext || "?"}). Formats : ${ALLOWED_EXTENSIONS.join(", ")}.` };
  }
  if (size <= 0 || size > MAX_FILE_BYTES) return { ok: false, error: "Le fichier doit faire moins de 25 Mo." };
  return { ok: true, value: { ext } };
}

const listSelect = {
  id: true, title: true, category: true, kind: true, fileName: true, sizeBytes: true, editionNumber: true, updatedAt: true, updatedByName: true,
} as const;

export async function listResources(filter: { editionNumber?: number; category?: ResourceCategoryKey } = {}) {
  return db.resource.findMany({
    where: { ...(filter.editionNumber ? { editionNumber: filter.editionNumber } : {}), ...(filter.category ? { category: filter.category } : {}) },
    select: listSelect,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getResource(id: string) {
  return db.resource.findUnique({ where: { id } });
}

export async function createNote(input: ResourceInput & { body: string; byName: string }) {
  return db.resource.create({
    data: { title: input.title, category: input.category, editionNumber: input.editionNumber, kind: "note", body: input.body, updatedByName: input.byName },
  });
}

export async function updateNote(id: string, input: ResourceInput & { body: string; byName: string }) {
  return db.resource.update({
    where: { id },
    data: { title: input.title, category: input.category, editionNumber: input.editionNumber, body: input.body, updatedByName: input.byName },
  });
}

export async function updateResourceMeta(id: string, input: ResourceInput & { byName: string }) {
  return db.resource.update({
    where: { id },
    data: { title: input.title, category: input.category, editionNumber: input.editionNumber, updatedByName: input.byName },
  });
}

// Étape 1 d'un envoi : l'admin reçoit une adresse d'envoi directe vers le
// stockage (le fichier ne passe pas par le serveur du site, donc pas de limite
// de taille de requête).
export async function createUploadTarget(fileName: string, size: number) {
  const checked = validateFileMeta(fileName, size);
  if (!checked.ok) return checked;
  const path = `${randomUUID()}-${safeStorageName(fileName)}`;
  const { data, error } = await createAdminClient().storage.from(RESOURCES_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false as const, error: "Impossible de préparer l'envoi." };
  return { ok: true as const, value: { path, token: data.token } };
}

export async function fileExists(path: string): Promise<boolean> {
  const { data } = await createAdminClient().storage.from(RESOURCES_BUCKET).list("", { search: path, limit: 5 });
  return (data ?? []).some((f) => f.name === path);
}

export async function registerFile(
  input: ResourceInput & { filePath: string; fileName: string; mimeType: string | null; sizeBytes: number; byName: string },
) {
  return db.resource.create({
    data: {
      title: input.title, category: input.category, editionNumber: input.editionNumber, kind: "file",
      filePath: input.filePath, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: input.sizeBytes, updatedByName: input.byName,
    },
  });
}

// Nouvelle version d'un fichier : on garde la fiche, on change le fichier et on
// supprime l'ancien du stockage.
export async function replaceFile(
  id: string,
  input: { filePath: string; fileName: string; mimeType: string | null; sizeBytes: number; byName: string },
) {
  const previous = await db.resource.findUniqueOrThrow({ where: { id } });
  const updated = await db.resource.update({
    where: { id },
    data: { filePath: input.filePath, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: input.sizeBytes, updatedByName: input.byName },
  });
  if (previous.filePath && previous.filePath !== input.filePath) {
    await createAdminClient().storage.from(RESOURCES_BUCKET).remove([previous.filePath]);
  }
  return updated;
}

export async function deleteResource(id: string) {
  const row = await db.resource.findUnique({ where: { id } });
  if (!row) return;
  if (row.filePath) await createAdminClient().storage.from(RESOURCES_BUCKET).remove([row.filePath]);
  await db.resource.delete({ where: { id } });
}

export async function signedFileUrl(path: string, opts: { seconds: number; downloadAs?: string }): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .storage.from(RESOURCES_BUCKET)
    .createSignedUrl(path, opts.seconds, opts.downloadAs ? { download: opts.downloadAs } : undefined);
  return error || !data ? null : data.signedUrl;
}
