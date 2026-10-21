"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

const input = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base outline-none focus:border-leaf-500 sm:text-sm";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

type Initial = { number: string; theme: string; dates: string; venue: string; eventDate: string };

export default function EditionForm({
  action,
  initial,
  submitLabel,
  lockNumber = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial: Initial;
  submitLabel: string;
  lockNumber?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = (name: keyof Initial) => state?.values?.[name] ?? initial[name];

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
        <div>
          <label htmlFor="number" className={label}>Numéro</label>
          <input id="number" name="number" type="number" min={1} max={99} required disabled={lockNumber} defaultValue={v("number")} className={`${input} disabled:opacity-60`} />
        </div>
        <div>
          <label htmlFor="theme" className={label}>Thème</label>
          <input id="theme" name="theme" required maxLength={120} defaultValue={v("theme")} placeholder="Ex. Tenir debout ensemble" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="eventDate" className={label}>Jour principal</label>
        <input id="eventDate" name="eventDate" type="date" defaultValue={v("eventDate")} className={input} />
        <p className="mt-1 text-xs text-ink/50">Sert au compte à rebours et aux échéances de la checklist. Laissez vide si la date n&apos;est pas fixée.</p>
      </div>
      <div>
        <label htmlFor="dates" className={label}>Dates (texte affiché)</label>
        <input id="dates" name="dates" required maxLength={80} defaultValue={v("dates")} placeholder="Ex. 12 et 13 juin 2027" className={input} />
      </div>
      <div>
        <label htmlFor="venue" className={label}>Lieu</label>
        <input id="venue" name="venue" required maxLength={120} defaultValue={v("venue")} placeholder="Ex. Palais des Congrès de Cotonou" className={input} />
      </div>
      <p className="rounded-xl bg-leaf-50 px-4 py-3 text-xs text-ink/65">
        Ces informations servent à l&apos;admin. Le site public et les emails d&apos;inscription gardent leurs propres textes, à mettre à jour séparément au lancement d&apos;une édition.
      </p>
      <button type="submit" disabled={pending} className="min-h-14 w-full rounded-full bg-leaf-600 px-6 text-base font-bold text-mist-50 disabled:opacity-60 sm:w-auto">
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
