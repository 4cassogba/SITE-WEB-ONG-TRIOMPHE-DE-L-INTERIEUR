"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* presse-papiers indisponible : rien à faire */
        }
      }}
      className="min-h-9 shrink-0 rounded-full border border-leaf-600 px-3 text-xs font-bold text-leaf-700"
    >
      {copied ? "Copié ✓" : "Copier"}
    </button>
  );
}
