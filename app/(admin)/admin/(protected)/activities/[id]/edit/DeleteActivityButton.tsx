"use client";

import { useTransition } from "react";
import { deleteActivityAction } from "../../actions";

export default function DeleteActivityButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Supprimer définitivement « ${title} » ? Pour la cacher sans la perdre, repassez-la en brouillon.`)) {
          startTransition(() => deleteActivityAction(id));
        }
      }}
      className="min-h-11 rounded-full border border-red-400 px-5 text-sm font-semibold text-red-700 active:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Suppression…" : "Supprimer cette activité"}
    </button>
  );
}
