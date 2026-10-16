import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listTeamMembers } from "@/lib/admin/team";
import TeamMemberActions from "./TeamMemberActions";

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
  const [session, members] = await Promise.all([requireAdmin(), listTeamMembers()]);

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
        {members.map((m) => {
          const isSelf = m.id === session.id;
          const suspended = m.suspendedAt !== null;
          return (
            <li
              key={m.id}
              className={`rounded-2xl border px-4 py-3.5 ${
                suspended ? "border-amber-300 bg-amber-50/60" : "border-ink/8 bg-mist-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate font-medium ${suspended ? "text-ink/50 line-through" : "text-ink"}`}>
                    {m.fullName}
                    {isSelf && <span className="ml-2 text-xs font-normal text-ink/50 no-underline">(vous)</span>}
                  </p>
                  {m.email && <p className="truncate text-sm text-ink/60">{m.email}</p>}
                  <p className="text-xs text-ink/45">
                    {suspended
                      ? `Suspendu le ${m.suspendedAt!.toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo" })}`
                      : `Ajouté le ${m.createdAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo" })}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <RolePill role={m.role} />
                  {suspended && (
                    <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900">
                      Suspendu
                    </span>
                  )}
                </div>
              </div>
              {!isSelf && (
                <div className="mt-3 border-t border-ink/8 pt-3">
                  <TeamMemberActions id={m.id} fullName={m.fullName} suspended={suspended} />
                </div>
              )}
            </li>
          );
        })}
        {members.length === 0 && (
          <li className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/50">
            Aucun membre pour l&apos;instant.
          </li>
        )}
      </ul>
    </div>
  );
}
