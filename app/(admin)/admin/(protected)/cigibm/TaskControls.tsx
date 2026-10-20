"use client";

import { useTransition } from "react";
import { TASK_STATUS_LABELS, type TaskStatusKey } from "@/lib/cigibm-hub";
import { cycleTaskStatusAction, deleteTaskAction, generateChecklistAction } from "./actions";

const STYLE: Record<TaskStatusKey, string> = {
  todo: "border-ink/20 bg-mist-50 text-ink/60",
  doing: "border-amber-400 bg-amber-100 text-amber-900",
  done: "border-leaf-600 bg-leaf-600 text-mist-50",
};

// Un appui fait avancer la tâche : À faire → En cours → Fait → À faire.
export function TaskStatusButton({ id, status }: { id: string; status: TaskStatusKey }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => cycleTaskStatusAction(id))}
      aria-label={`Statut : ${TASK_STATUS_LABELS[status]}. Appuyer pour changer.`}
      className={`inline-flex min-h-9 w-[5.5rem] shrink-0 items-center justify-center gap-1 rounded-full border text-xs font-bold transition-colors disabled:opacity-60 ${STYLE[status]}`}
    >
      {status === "done" && <span aria-hidden>✓</span>}
      {pending ? "…" : TASK_STATUS_LABELS[status]}
    </button>
  );
}

export function GenerateChecklistButton({ editionNumber, hasDate }: { editionNumber: number; hasDate: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (hasDate || confirm("La date de l'édition n'est pas définie : les tâches seront créées sans échéance. Continuer ?")) {
          start(() => generateChecklistAction(editionNumber));
        }
      }}
      className="min-h-12 rounded-full bg-leaf-600 px-6 text-sm font-bold text-mist-50 disabled:opacity-60"
    >
      {pending ? "Création…" : "Générer la checklist type"}
    </button>
  );
}

export function DeleteTaskButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cette tâche ?")) start(() => deleteTaskAction(id));
      }}
      className="min-h-11 rounded-full border border-red-400/50 px-5 text-sm font-semibold text-red-700 disabled:opacity-60"
    >
      {pending ? "Suppression…" : "Supprimer la tâche"}
    </button>
  );
}
