"use client";

import { useActionState, useEffect, useRef } from "react";
import { TASK_CATEGORIES, TASK_CATEGORY_LABELS } from "@/lib/cigibm-hub";
import type { FormState } from "./actions";

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

type Initial = { title: string; category: string; dueDate: string; owner: string; notes: string };

export default function TaskForm({
  action,
  initial,
  submitLabel,
  compact = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Initial;
  submitLabel: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = (name: keyof Initial, fallback: string) => state?.values?.[name] ?? fallback;
  const ref = useRef<HTMLFormElement>(null);
  // Ajout réussi (état null après un envoi) : on vide le formulaire pour la tâche suivante.
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error && compact) ref.current?.reset();
    wasPending.current = pending;
  }, [pending, state, compact]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <div>
        <label htmlFor="task-title" className={label}>Tâche</label>
        <input id="task-title" name="title" required maxLength={160} defaultValue={v("title", initial?.title ?? "")} placeholder="Ex. Confirmer le traiteur" className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="task-category" className={label}>Catégorie</label>
          <select id="task-category" name="category" defaultValue={v("category", initial?.category ?? "logistique")} className={input}>
            {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-due" className={label}>Échéance</label>
          <input id="task-due" name="dueDate" type="date" defaultValue={v("dueDate", initial?.dueDate ?? "")} className={input} />
        </div>
        <div>
          <label htmlFor="task-owner" className={label}>Responsable</label>
          <input id="task-owner" name="owner" maxLength={80} defaultValue={v("owner", initial?.owner ?? "")} placeholder="Ex. Christelle" className={input} />
        </div>
      </div>
      {!compact && (
        <div>
          <label htmlFor="task-notes" className={label}>Notes</label>
          <textarea id="task-notes" name="notes" rows={4} maxLength={1000} defaultValue={v("notes", initial?.notes ?? "")} className={input} />
        </div>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-leaf-600 px-6 text-sm font-bold text-mist-50 disabled:opacity-60 sm:w-auto">
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
