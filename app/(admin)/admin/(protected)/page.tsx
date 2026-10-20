import Link from "next/link";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { countLeadsToContact } from "@/lib/admin/leads";
import { listEditions, pickDefaultEdition } from "@/lib/admin/cigibm";
import { editionPhase, phaseLabel } from "@/lib/cigibm-hub";

export default async function AdminDashboardPage() {
  const now = new Date();
  const [stats, leads, editions] = await Promise.all([getDashboardStats(), countLeadsToContact(), listEditions()]);
  const currentNumber = pickDefaultEdition(editions, now);
  const current = editions.find((e) => e.number === currentNumber);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Tableau de bord</h1>

      {current && (
        <Link href={`/admin/cigibm?edition=${current.number}`} className="mt-6 block rounded-2xl bg-leaf-900 p-5 text-mist-50 active:bg-leaf-800">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-leaf-300">Hub CIGIBM · édition {current.number}</span>
              <span className="mt-1 block font-display text-xl leading-tight">{current.theme}</span>
              <span className="mt-1 block text-xs text-mist-50/70">{current.dates}</span>
            </span>
            <span className="shrink-0 rounded-xl bg-mist-50/10 px-3 py-2 text-center font-display text-lg leading-none">{phaseLabel(editionPhase(current.eventDate, now))}</span>
          </span>
          <span className="mt-4 block text-sm font-semibold text-leaf-200">Préparation, public, communication et documents →</span>
        </Link>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-ink/8 bg-mist-50 p-4 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-ink/50 sm:text-xs">Participants</p>
          <p className="mt-2 font-display text-4xl text-leaf-900">{stats.totalParticipants}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-mist-50 p-4 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-ink/50 sm:text-xs">Présents aujourd&apos;hui</p>
          <p className="mt-2 font-display text-4xl text-leaf-900">{stats.attendedToday}</p>
        </div>
      </div>

      <Link
        href="/admin/scan"
        className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-leaf-600 text-base font-semibold text-mist-50 active:bg-leaf-700 lg:hidden"
      >
        Ouvrir le scanner d&apos;entrée
      </Link>

      <Link
        href="/admin/leads"
        className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 transition-colors active:bg-leaf-50 ${
          leads.needsHelp > 0 ? "border-amber-400 bg-amber-50/70" : "border-ink/8 bg-mist-50"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-leaf-900">Contacts à rappeler</span>
          <span className="block text-xs text-ink/55">
            {leads.total === 0 ? "Personne en attente" : `${leads.total} en attente${leads.needsHelp > 0 ? ` · dont ${leads.needsHelp} qui demande${leads.needsHelp > 1 ? "nt" : ""} de l'aide` : ""}`}
          </span>
        </span>
        <span className="font-display text-3xl text-leaf-900">{leads.total}</span>
      </Link>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/60">Par édition</h2>
        <ul className="mt-3 space-y-2">
          {stats.participantsByEdition.map((e) => (
            <li key={e.editionNumber}>
              <Link
                href={`/admin/cigibm?edition=${e.editionNumber}`}
                className="flex items-center justify-between rounded-xl border border-ink/8 bg-mist-50 px-4 py-3.5 text-sm active:bg-leaf-50"
              >
                <span>Édition {e.editionNumber}</span>
                <span className="flex items-center gap-2 font-semibold text-leaf-900">
                  {e.count}
                  <span aria-hidden className="font-normal text-ink/30">›</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
