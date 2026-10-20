"use client";

import { useTransition } from "react";
import { setLeadContactedAction } from "./actions";

export default function ContactedButton({ id, contacted }: { id: string; contacted: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setLeadContactedAction(id, !contacted))}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
        contacted ? "border-ink/15 text-ink/60 active:bg-ink/5" : "border-leaf-600 bg-leaf-600 text-mist-50 active:bg-leaf-700"
      }`}
    >
      {pending ? "…" : contacted ? "Remettre à rappeler" : "Marquer comme contacté"}
    </button>
  );
}
