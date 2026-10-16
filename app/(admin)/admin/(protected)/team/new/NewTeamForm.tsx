"use client";

import { useActionState, useState } from "react";
import { addScannersAction, type BatchRow } from "./actions";

const LOGIN_URL = "https://www.ongtriomphedelinterieur.com/admin/login";

function buildMessage(rows: BatchRow[]) {
  const accounts = rows
    .filter((r) => r.status === "created")
    .map((r) => `${r.fullName}\nEmail : ${r.email}\nMot de passe : ${r.password}`)
    .join("\n\n");
  return (
    `Scan des badges CIGIBM\n\n1. Ouvrez ${LOGIN_URL} sur votre téléphone\n` +
    `2. Connectez-vous avec vos identifiants ci-dessous\n3. Autorisez la caméra, puis pointez le QR code de chaque badge\n\n${accounts}`
  );
}

export default function NewTeamForm() {
  const [state, formAction, pending] = useActionState(addScannersAction, null);
  const [copied, setCopied] = useState(false);

  async function copyAll(rows: BatchRow[]) {
    await navigator.clipboard.writeText(buildMessage(rows));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state?.rows) {
    const rows = state.rows;
    return (
      <div className="mt-6 max-w-2xl space-y-4">
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.email} className="rounded-2xl border border-ink/8 bg-mist-50 p-4">
              <p className="font-semibold text-leaf-900">{r.fullName}</p>
              <p className="mt-1 break-all text-sm text-ink/70">{r.email}</p>
              <p className="mt-2 text-sm">
                {r.status === "created" && (
                  <>
                    <span className="text-ink/50">Mot de passe : </span>
                    <span className="rounded-md bg-leaf-50 px-2 py-1 font-mono text-base font-semibold text-leaf-900">{r.password}</span>
                  </>
                )}
                {r.status === "attributed" && <span className="text-ink/60">Compte existant, mot de passe inchangé</span>}
                {r.status === "unchanged" && <span className="text-ink/60">Déjà admin, laissé tel quel</span>}
                {r.status === "failed" && <span className="text-red-700">Échec, vérifiez l&apos;email</span>}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/60">Notez ces mots de passe maintenant : ils ne seront plus affichés.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copyAll(rows)}
            className="rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-mist-50"
          >
            {copied ? "Copié !" : "Copier le message pour WhatsApp"}
          </button>
          <a href="/admin/team" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold">
            Voir l&apos;équipe
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      {state?.error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-base sm:text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label htmlFor="names" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
          Noms (une personne par ligne)
        </label>
        <textarea
          id="names"
          name="names"
          required
          rows={6}
          placeholder={"Awa Dossou\nFatou Diallo\nMarie Koffi"}
          className="w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base sm:text-sm"
        />
        <p className="mt-1 text-xs text-ink/50">
          L&apos;email et le mot de passe sont créés automatiquement. Pour une personne qui a déjà un compte, écrivez
          « Nom, son-email@exemple.com » : le rôle lui est attribué sans changer son mot de passe.
        </p>
      </div>
      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
          Rôle
        </label>
        <select id="role" name="role" defaultValue="scanner" className="w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base sm:text-sm">
          <option value="scanner">Scanner (hôtesse, scan des badges uniquement)</option>
          <option value="admin">Admin (accès complet)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-mist-50 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Création…" : "Créer les comptes"}
      </button>
    </form>
  );
}
