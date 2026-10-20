"use client";

import { useTransition } from "react";
import { setPublishedAction } from "./actions";

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setPublishedAction(id, !published))}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
        published ? "border-ink/15 text-ink/70 active:bg-ink/5" : "border-leaf-600 bg-leaf-600 text-mist-50 active:bg-leaf-700"
      }`}
    >
      {pending ? "…" : published ? "Retirer du site" : "Publier sur le site"}
    </button>
  );
}
