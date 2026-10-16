"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";

// false pendant le rendu serveur et l'hydratation, true une fois le JS actif.
const subscribeNoop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hydrated = useHydrated();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.code === "user_banned"
          ? "Ce compte est suspendu. Contactez l'administrateur."
          : "Identifiants incorrects. Vérifiez votre email et mot de passe."
      );
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    // Sur réseau lent, un tap avant le chargement du JS envoyait le formulaire
    // HTML natif en GET : email et mot de passe en clair dans l'URL et
    // l'historique, sans connexion. Bouton bloqué jusqu'à l'hydratation, et
    // method="post" pour qu'aucun identifiant ne finisse jamais dans l'URL.
    <form method="post" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base sm:text-sm outline-none focus:border-leaf-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-base sm:text-sm outline-none focus:border-leaf-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !hydrated}
        className="min-h-12 w-full rounded-full bg-leaf-600 px-6 py-3 text-base font-semibold text-mist-50 transition-colors hover:bg-leaf-700 disabled:opacity-60 sm:text-sm"
      >
        {!hydrated ? "Chargement…" : loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
