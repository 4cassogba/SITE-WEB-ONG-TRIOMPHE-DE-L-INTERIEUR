"use client";

import { useActionState } from "react";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS } from "@/lib/resources-meta";
import type { NoteFormState } from "./actions";

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

// Titre, catégorie et édition d'un fichier (le contenu d'un fichier ne se
// modifie pas ici : voir « Remplacer par une nouvelle version »).
export default function MetaOnlyForm({
  action,
  title,
  category,
  editionNumber,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  title: string;
  category: string;
  editionNumber: number | null;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = (name: string, fallback: string) => state?.values?.[name] ?? fallback;
  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <div>
        <label htmlFor="title" className={label}>Titre</label>
        <input id="title" name="title" required maxLength={120} defaultValue={v("title", title)} className={input} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={label}>Catégorie</label>
          <select id="category" name="category" defaultValue={v("category", category)} className={input}>
            {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{RESOURCE_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="editionNumber" className={label}>Édition CIGIBM liée (facultatif)</label>
          <input id="editionNumber" name="editionNumber" type="number" min={1} max={99} defaultValue={v("editionNumber", editionNumber ? String(editionNumber) : "")} className={input} />
        </div>
      </div>
      <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-leaf-600 px-6 text-sm font-bold text-mist-50 disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
