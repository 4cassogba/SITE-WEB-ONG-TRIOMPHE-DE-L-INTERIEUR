"use client";

import { useState, useTransition } from "react";
import {
  reactivateTeamMemberAction,
  removeTeamMemberAction,
  suspendTeamMemberAction,
  type TeamActionResult,
} from "./actions";

export default function TeamMemberActions({
  id,
  fullName,
  suspended,
}: {
  id: string;
  fullName: string;
  suspended: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<TeamActionResult>, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (result.error) setError(result.error);
    });
  }

  const buttonClass =
    "min-h-11 flex-1 rounded-full border px-4 text-sm font-semibold transition-colors disabled:opacity-50 sm:flex-none";

  return (
    <div className="w-full">
      <div className="flex gap-2">
        {suspended ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(reactivateTeamMemberAction)}
            className={`${buttonClass} border-leaf-600 text-leaf-700 active:bg-leaf-50`}
          >
            Réactiver
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                suspendTeamMemberAction,
                `Suspendre ${fullName} ? Son accès est coupé immédiatement, vous pourrez le réactiver plus tard.`
              )
            }
            className={`${buttonClass} border-amber-500 text-amber-700 active:bg-amber-50`}
          >
            Suspendre
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              removeTeamMemberAction,
              `Retirer définitivement ${fullName} ? Son compte de connexion sera supprimé. Les présences déjà enregistrées sont conservées.`
            )
          }
          className={`${buttonClass} border-red-400 text-red-700 active:bg-red-50`}
        >
          Retirer
        </button>
      </div>
      {pending && <p className="mt-2 text-xs text-ink/50">En cours…</p>}
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
