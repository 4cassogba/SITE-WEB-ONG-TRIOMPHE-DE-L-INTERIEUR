"use client";

import { useState } from "react";
import { previewUrlAction } from "./actions";

// Aperçu des fichiers Office (Word, PowerPoint, Excel) sans téléchargement.
// Le navigateur ne sait pas les afficher seul : on passe par la visionneuse en
// ligne de Microsoft, qui récupère le fichier par un lien signé de 15 minutes.
// C'est donc un service tiers : l'aperçu ne se charge qu'à la demande.
export default function OfficePreview({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    setError(null);
    const res = await previewUrlAction(id);
    setBusy(false);
    if ("error" in res) return setError(res.error);
    setSrc(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(res.url)}`);
  }

  if (!src) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-mist-50 p-6 text-center">
        <p className="text-sm text-ink/70">
          Aperçu dans la page, sans télécharger. Il s&apos;affiche via la visionneuse en ligne de Microsoft : le fichier lui est transmis le temps de l&apos;aperçu (lien valable 15 minutes).
        </p>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button type="button" onClick={load} disabled={busy} className="mt-4 min-h-12 rounded-full bg-leaf-600 px-6 text-sm font-bold text-mist-50 disabled:opacity-60">
          {busy ? "Chargement…" : "Afficher l'aperçu"}
        </button>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-mist-50">
      <iframe title="Aperçu du document" src={src} className="h-[70vh] min-h-[28rem] w-full" allowFullScreen />
    </div>
  );
}
