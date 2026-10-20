"use client";

import { useActionState } from "react";
import { ACTIVITY_AXES, ACTIVITY_STATUSES, AXIS_LABELS, STATUS_LABELS } from "@/lib/activities-meta";
import type { ActivityFormState } from "./actions";

type Initial = {
  title: string;
  summary: string;
  description: string | null;
  axis: string;
  audience: string | null;
  status: string;
  published: boolean;
  sortOrder: number;
  href: string | null;
  internalNote: string | null;
};

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

export default function ActivityForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ActivityFormState, formData: FormData) => Promise<ActivityFormState>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  // Après une erreur, on repart de ce qui vient d'être saisi (voir actions.ts).
  const v = (name: keyof Initial, fallback: string) => state?.values?.[name] ?? fallback;

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      {state?.error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="title" className={label}>Titre</label>
        <input id="title" name="title" required maxLength={120} defaultValue={v("title", initial?.title ?? "")} className={input} />
      </div>

      <div>
        <label htmlFor="summary" className={label}>Résumé (affiché sur le site)</label>
        <textarea id="summary" name="summary" required rows={3} maxLength={280} defaultValue={v("summary", initial?.summary ?? "")} className={input} />
        <p className="mt-1 text-xs text-ink/50">Une ou deux phrases, 280 caractères maximum.</p>
      </div>

      <div>
        <label htmlFor="description" className={label}>Description détaillée (facultatif)</label>
        <textarea id="description" name="description" rows={5} defaultValue={v("description", initial?.description ?? "")} className={input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="axis" className={label}>Axe de mission</label>
          <select id="axis" name="axis" defaultValue={v("axis", initial?.axis ?? "guerison")} className={input}>
            {ACTIVITY_AXES.map((a) => (
              <option key={a} value={a}>{AXIS_LABELS[a].title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={label}>Statut</label>
          <select id="status" name="status" defaultValue={v("status", initial?.status ?? "en_projet")} className={input}>
            {ACTIVITY_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="audience" className={label}>Public concerné (facultatif)</label>
        <input id="audience" name="audience" defaultValue={v("audience", initial?.audience ?? "")} placeholder="Ex. Femmes et jeunes" className={input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <div>
          <label htmlFor="href" className={label}>Lien « En savoir plus » (facultatif)</label>
          <input id="href" name="href" defaultValue={v("href", initial?.href ?? "")} placeholder="/cigibm ou https://…" className={input} />
        </div>
        <div>
          <label htmlFor="sortOrder" className={label}>Ordre</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={v("sortOrder", String(initial?.sortOrder ?? 0))} className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="internalNote" className={label}>Note interne (jamais affichée au public)</label>
        <textarea id="internalNote" name="internalNote" rows={3} defaultValue={v("internalNote", initial?.internalNote ?? "")} className={input} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/12 bg-mist-50 p-4 text-sm">
        <input type="checkbox" name="published" defaultChecked={state?.values ? state.values.published === "on" : initial?.published} className="mt-0.5 h-5 w-5 shrink-0 accent-[#307335]" />
        <span>
          <strong>Publier sur le site.</strong> Décoché, l&apos;activité reste un brouillon visible seulement ici.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-h-14 w-full rounded-full bg-leaf-600 px-6 text-base font-bold text-mist-50 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
