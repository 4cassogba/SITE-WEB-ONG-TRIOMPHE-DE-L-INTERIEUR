"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EXTENSIONS, MAX_FILE_BYTES, RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS } from "@/lib/resources-meta";
import { prepareUploadAction, registerUploadAction, replaceUploadAction } from "./actions";

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";
const BUCKET = "ressources";

// Envoi direct navigateur → stockage privé (le fichier ne passe pas par le
// serveur du site : pas de limite de taille de requête). `replaceId` : on
// remplace le fichier d'une fiche existante au lieu d'en créer une.
export default function FileUploader({ replaceId, defaultEdition }: { replaceId?: string; defaultEdition?: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Choisissez un fichier.");
    if (file.size > MAX_FILE_BYTES) return setError("Le fichier doit faire moins de 25 Mo.");
    setBusy(true);
    try {
      const target = await prepareUploadAction(file.name, file.size);
      if (!target.ok) return setError(target.error);
      const { error: upErr } = await createClient().storage.from(BUCKET).uploadToSignedUrl(target.value.path, target.value.token, file, { contentType: file.type || undefined });
      if (upErr) return setError("L'envoi du fichier a échoué. Réessayez.");
      const upload = { path: target.value.path, fileName: file.name, mimeType: file.type || null, size: file.size };
      if (replaceId) {
        const res = await replaceUploadAction(replaceId, upload);
        if (!res.ok) return setError(res.error);
        router.push(`/admin/resources/${replaceId}`);
      } else {
        const res = await registerUploadAction(upload, {
          title: String(form.get("title") || file.name.replace(/\.[^.]+$/, "")),
          category: String(form.get("category") || "autre"),
          editionNumber: String(form.get("editionNumber") || ""),
        });
        if (!res.ok) return setError(res.error);
        router.push(`/admin/resources/${res.id}`);
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-5">
      {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div>
        <label htmlFor="file" className={label}>Fichier</label>
        <input id="file" name="file" type="file" required accept={ALLOWED_EXTENSIONS.map((x) => `.${x}`).join(",")} className={`${input} file:mr-3 file:rounded-full file:border-0 file:bg-leaf-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-leaf-800`} />
        <p className="mt-1 text-xs text-ink/50">PDF, Word, PowerPoint, Excel, images, texte. 25 Mo maximum.</p>
      </div>
      {!replaceId && (
        <>
          <div>
            <label htmlFor="title" className={label}>Titre (facultatif, le nom du fichier par défaut)</label>
            <input id="title" name="title" maxLength={120} className={input} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={label}>Catégorie</label>
              <select id="category" name="category" defaultValue={defaultEdition ? "cigibm" : "autre"} className={input}>
                {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{RESOURCE_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="editionNumber" className={label}>Édition CIGIBM liée (facultatif)</label>
              <input id="editionNumber" name="editionNumber" type="number" min={1} max={99} defaultValue={defaultEdition ?? ""} className={input} />
            </div>
          </div>
        </>
      )}
      <button type="submit" disabled={busy} className="min-h-14 w-full rounded-full bg-leaf-600 px-6 text-base font-bold text-mist-50 disabled:opacity-60 sm:w-auto">
        {busy ? "Envoi en cours…" : replaceId ? "Remplacer le fichier" : "Ajouter le fichier"}
      </button>
    </form>
  );
}
