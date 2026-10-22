import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getEditionHub, listEditions, pickDefaultEdition } from "@/lib/admin/cigibm";
import { CIGIBM_SPACE, cigibmHref, editionPhase, hasPreparation } from "@/lib/cigibm-hub";
import PhasePill from "./PhasePill";

const ordinal = (n: number) => (n === 1 ? "1ère" : `${n}ème`);

export default async function EventsPage() {
  await requireAdmin();
  const now = new Date();
  const editions = await listEditions();
  const currentNumber = pickDefaultEdition(editions, now);
  const hub = currentNumber ? await getEditionHub(currentNumber, now) : null;
  const nextNumber = editions.length ? Math.max(...editions.map((e) => e.number)) + 1 : 1;
  const alerts = hub ? hub.insights.filter((i) => i.level === "alert").length : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Événements</h1>
      <p className="mt-1 text-sm text-ink/60">Les rendez-vous organisés par l&apos;ONG, de la préparation au bilan.</p>

      {/* ---------- CIGIBM : l'événement phare ---------- */}
      <section className="mt-6 overflow-hidden rounded-3xl bg-leaf-900 text-mist-50">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-display text-3xl leading-none">CIGIBM</p>
            <span className="rounded-full bg-mist-50/12 px-3 py-1 text-xs font-medium text-leaf-200">Rendez-vous annuel</span>
          </div>
          <p className="mt-2 text-sm text-mist-50/70">Congrès International de Guérison Intérieure et de Bien-être Mental</p>

          {hub && (
            <div className="mt-6 rounded-2xl bg-mist-50/8 p-4 ring-1 ring-mist-50/10 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-sm font-medium text-leaf-200">{ordinal(hub.edition.number)} édition</p>
                <PhasePill phase={hub.phase} dark />
                {alerts > 0 && <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-leaf-950">{alerts} à traiter</span>}
              </div>
              <p className="mt-2 font-display text-2xl leading-tight">{hub.edition.theme}</p>
              <p className="mt-1 text-sm text-mist-50/70">{hub.edition.dates}, {hub.edition.venue}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-mist-50/10 pt-4">
                <div>
                  <dt className="text-xs text-mist-50/60">Inscrits</dt>
                  <dd className="font-display text-2xl">{hub.stats.participants}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mist-50/60">Présents</dt>
                  <dd className="font-display text-2xl">{hub.stats.attended}</dd>
                </div>
                {hasPreparation(hub.phase) ? (
                  <div>
                    <dt className="text-xs text-mist-50/60">Préparation</dt>
                    <dd className={`font-display ${hub.tasks.length ? "text-2xl" : "whitespace-nowrap pt-1.5 text-lg"}`}>{hub.tasks.length ? `${Math.round((hub.tasksDone / hub.tasks.length) * 100)} %` : "À lancer"}</dd>
                  </div>
                ) : (
                  <div>
                    <dt className="text-xs text-mist-50/60">Présence</dt>
                    <dd className="font-display text-2xl">{hub.stats.attendanceRate} %</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={cigibmHref(currentNumber)} className="inline-flex min-h-12 items-center rounded-full bg-mist-50 px-5 text-sm font-bold text-leaf-900">
              Ouvrir l&apos;espace CIGIBM
            </Link>
            <Link href={`${CIGIBM_SPACE}/editions/new`} className="inline-flex min-h-12 items-center rounded-full border border-mist-50/30 px-5 text-sm font-semibold text-mist-50">
              Préparer l&apos;édition {nextNumber}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Toutes les éditions ---------- */}
      <section className="mt-8">
        <h2 className="font-display text-xl text-leaf-900">Toutes les éditions du CIGIBM</h2>
        <ul className="mt-3 space-y-2.5">
          {[...editions].reverse().map((e) => (
            <li key={e.number}>
              <Link href={cigibmHref(e.number)} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-mist-50 p-4 active:bg-leaf-50 sm:hover:border-leaf-300">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-display text-xl text-leaf-800">{e.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-leaf-900">{e.theme}</span>
                  <span className="mt-0.5 block text-xs text-ink/55">{e.dates}, {e.venue}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <PhasePill phase={editionPhase(e.eventDate, now)} />
                    {e._count.participants > 0 && <span className="text-xs text-ink/55">{e._count.participants} inscrits</span>}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-xl text-ink/30">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
