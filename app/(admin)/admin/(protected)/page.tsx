import Link from "next/link";
import { getDashboardStats } from "@/lib/admin/dashboard";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Tableau de bord</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-ink/8 bg-mist-50 p-4 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-ink/50 sm:text-xs">Participants</p>
          <p className="mt-2 font-display text-4xl text-leaf-900">{stats.totalParticipants}</p>
        </div>
        <div className="rounded-2xl bg-leaf-900 p-4 text-mist-50 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-mist-50/70 sm:text-xs">Présents aujourd&apos;hui</p>
          <p className="mt-2 font-display text-4xl">{stats.attendedToday}</p>
        </div>
      </div>

      <Link
        href="/admin/scan"
        className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-leaf-600 text-base font-semibold text-mist-50 active:bg-leaf-700 lg:hidden"
      >
        Ouvrir le scanner d&apos;entrée
      </Link>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/60">Par édition</h2>
        <ul className="mt-3 space-y-2">
          {stats.participantsByEdition.map((e) => (
            <li
              key={e.editionNumber}
              className="flex items-center justify-between rounded-xl border border-ink/8 bg-mist-50 px-4 py-3.5 text-sm"
            >
              <span>Édition {e.editionNumber}</span>
              <span className="font-semibold text-leaf-900">{e.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
