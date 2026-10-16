import Link from "next/link";
import { listTeamMembers } from "@/lib/admin/team";

const roleLabel: Record<"admin" | "scanner", string> = {
  admin: "Admin",
  scanner: "Scanner (hôtesse)",
};

export default async function TeamPage() {
  const members = await listTeamMembers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-leaf-900">Équipe</h1>
        <Link
          href="/admin/team/new"
          className="rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-mist-50"
        >
          Ajouter un membre
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8 bg-mist-50">
        <table className="w-full text-sm">
          <thead className="bg-leaf-50 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Ajouté le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-ink">{m.fullName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      m.role === "admin" ? "bg-azure-100 text-azure-800" : "bg-leaf-100 text-leaf-800"
                    }`}
                  >
                    {roleLabel[m.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/60">{m.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                  Aucun membre pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
