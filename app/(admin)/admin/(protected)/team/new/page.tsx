import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { upsertTeamMember } from "@/lib/admin/team";

const inputClass = "w-full rounded-xl border border-ink/15 bg-mist-50 px-4 py-3 text-sm";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

export default async function NewTeamMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;

  async function addTeamMemberAction(formData: FormData) {
    "use server";

    await requireAdmin();

    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const role = formData.get("role")?.toString();

    if (!fullName || !email || !password || (role !== "admin" && role !== "scanner")) {
      redirect("/admin/team/new?erreur=champs");
    }

    try {
      await upsertTeamMember({ fullName, email, password, role });
    } catch (err) {
      console.error("Admin team member creation/attribution failed", err);
      redirect("/admin/team/new?erreur=supabase");
    }

    redirect("/admin/team");
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-leaf-900">Ajouter un membre de l&apos;équipe</h1>
      <p className="mt-2 max-w-xl text-sm text-ink/60">
        Un compte « Scanner » n&apos;a accès qu&apos;à l&apos;écran de scan des badges à l&apos;entrée, jamais au reste
        de l&apos;admin. Si l&apos;email existe déjà (compte créé plus tôt), le rôle choisi lui est simplement
        attribué, sans toucher à son mot de passe.
      </p>

      {erreur === "champs" && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          Tous les champs sont obligatoires.
        </p>
      )}
      {erreur === "supabase" && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          La création du compte a échoué. Vérifiez l&apos;email (et un mot de passe d&apos;au moins 6 caractères) puis
          réessayez.
        </p>
      )}

      <form action={addTeamMemberAction} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Nom complet
          </label>
          <input id="fullName" name="fullName" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="off" className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={6}
            autoComplete="off"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/50">
            Au moins 6 caractères, visible ici pour pouvoir le communiquer à l&apos;oral.
          </p>
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Rôle
          </label>
          <select id="role" name="role" defaultValue="scanner" className={inputClass}>
            <option value="scanner">Scanner (hôtesse, scan des badges uniquement)</option>
            <option value="admin">Admin (accès complet)</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-leaf-600 px-6 py-3 text-sm font-semibold text-mist-50 sm:w-auto"
        >
          Créer / attribuer l&apos;accès
        </button>
      </form>
    </div>
  );
}
