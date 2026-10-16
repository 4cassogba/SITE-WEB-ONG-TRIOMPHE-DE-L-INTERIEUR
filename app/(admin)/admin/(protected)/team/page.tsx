import Link from "next/link";
import { listTeamMembers } from "@/lib/admin/team";

const roleLabel: Record<"admin" | "scanner", string> = {
  admin: "Admin",
  scanner: "Scanner (hôtesse)",
};

function RolePill({ role }: { role: "admin" | "scanner" }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        role === "admin" ? "bg-azure-100 text-azure-800" : "bg-leaf-100 text-leaf-800"
      }`}
    >
      {roleLabel[role]}
    </span>
  );
}

export default async function TeamPage() {
  const members = await listTeamMembers();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Équipe</h1>
        <Link
          href="/admin/team/new"
          className="inline-flex min-h-12 items-center rounded-full bg-leaf-600 px-5 text-sm font-semibold text-mist-50 active:bg-leaf-700"
        >
          Ajouter des hôtesses
        </Link>
      </div>

      <ul className="mt-6 space-y-3">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-mist-50 px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{m.fullName}</p>
              <p className="text-xs text-ink/50">Ajouté le {m.createdAt.toLocaleDateString("fr-FR")}</p>
            </div>
            <RolePill role={m.role} />
          </li>
        ))}
        {members.length === 0 && (
          <li className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/50">
            Aucun membre pour l&apos;instant.
          </li>
        )}
      </ul>
    </div>
  );
}
