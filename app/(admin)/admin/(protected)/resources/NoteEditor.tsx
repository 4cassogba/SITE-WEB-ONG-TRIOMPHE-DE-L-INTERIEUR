"use client";

import { useActionState, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS } from "@/lib/resources-meta";
import type { NoteFormState } from "./actions";

type Initial = { title: string; category: string; editionNumber: number | null; body: string };

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

export default function NoteEditor({
  action,
  initial,
  submitLabel,
  cancelHref,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  initial: Initial;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = (name: string, fallback: string) => state?.values?.[name] ?? fallback;
  const [body, setBody] = useState(initial.body);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <div>
        <label htmlFor="title" className={label}>Titre</label>
        <input id="title" name="title" required maxLength={120} defaultValue={v("title", initial.title)} className={input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={label}>Catégorie</label>
          <select id="category" name="category" defaultValue={v("category", initial.category)} className={input}>
            {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{RESOURCE_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="editionNumber" className={label}>Édition CIGIBM liée (facultatif)</label>
          <input id="editionNumber" name="editionNumber" type="number" min={1} max={99} defaultValue={v("editionNumber", initial.editionNumber ? String(initial.editionNumber) : "")} placeholder="Ex. 5" className={input} />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="body" className="text-xs font-medium uppercase tracking-wide text-ink/60">Contenu</label>
          <div className="flex rounded-full border border-ink/12 bg-mist-50 p-0.5 text-xs font-semibold lg:hidden">
            {(["edit", "preview"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 ${tab === t ? "bg-leaf-700 text-mist-50" : "text-ink/60"}`}>
                {t === "edit" ? "Écrire" : "Aperçu"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={tab === "preview" ? "hidden lg:block" : ""}>
            <textarea
              id="body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={22}
              spellCheck
              className={`${input} min-h-[26rem] resize-y font-mono text-[13px] leading-relaxed`}
            />
            <p className="mt-1.5 text-xs text-ink/50">
              Markdown : <code># Titre</code>, <code>## Sous-titre</code>, <code>**gras**</code>, <code>- liste</code>, <code>&gt; citation</code>, tableaux avec <code>| a | b |</code>.
            </p>
          </div>
          <div className={`rounded-2xl border border-ink/10 bg-mist-50 p-4 ${tab === "edit" ? "hidden lg:block" : ""}`}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">Aperçu</p>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink/85 [&_blockquote]:border-l-4 [&_blockquote]:border-leaf-500 [&_blockquote]:bg-leaf-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_h1]:mt-4 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:text-leaf-900 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-leaf-900 [&_li]:ml-5 [&_ol]:list-decimal [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-ink/12 [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-ink/12 [&_th]:bg-leaf-800 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-mist-50 [&_ul]:list-disc">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "*Rien à afficher pour l'instant.*"}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="min-h-14 w-full rounded-full bg-leaf-600 px-6 text-base font-bold text-mist-50 disabled:opacity-60 sm:w-auto">
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <a href={cancelHref} className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-ink/60 underline underline-offset-4">Annuler</a>
      </div>
    </form>
  );
}
