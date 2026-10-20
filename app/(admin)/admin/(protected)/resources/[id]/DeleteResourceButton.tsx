"use client";

import { useTransition } from "react";
import { deleteResourceAction } from "../actions";

export default function DeleteResourceButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer ce document définitivement ?")) start(() => deleteResourceAction(id));
      }}
      className="min-h-11 rounded-full border border-red-400/50 px-5 text-sm font-semibold text-red-700 disabled:opacity-60"
    >
      {pending ? "Suppression…" : "Supprimer ce document"}
    </button>
  );
}
