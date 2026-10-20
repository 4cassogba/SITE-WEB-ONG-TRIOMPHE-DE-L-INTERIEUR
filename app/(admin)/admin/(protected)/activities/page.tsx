import Link from "next/link";
import { listActivities } from "@/lib/admin/activities";
import { ACTIVITY_AXES, AXIS_LABELS, STATUS_LABELS, type ActivityStatusValue } from "@/lib/activities-meta";
import PublishToggle from "./PublishToggle";

const statusStyle: Record<ActivityStatusValue, string> = {
  en_cours: "bg-leaf-100 text-leaf-800",
  en_projet: "bg-amber-100 text-amber-900",
  terminee: "bg-ink/8 text-ink/60",
};

export default async function ActivitiesPage() {
  const activities = await listActivities();
  const published = activities.filter((a) => a.published).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Activités</h1>
        <Link
          href="/admin/activities/new"
          className="inline-flex min-h-12 items-center rounded-full bg-leaf-600 px-5 text-sm font-semibold text-mist-50 active:bg-leaf-700"
        >
          Nouvelle activité
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        {published} publiée{published > 1 ? "s" : ""} sur {activities.length}. Rien n&apos;apparaît sur le site tant
        qu&apos;une activité n&apos;est pas publiée.
      </p>

      {ACTIVITY_AXES.map((axis) => {
        const items = activities.filter((a) => a.axis === axis);
        return (
          <section key={axis} className="mt-10">
            <h2 className="font-display text-xl text-leaf-900">{AXIS_LABELS[axis].title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink/50">Objet déclaré : {AXIS_LABELS[axis].statutory}</p>
            <ul className="mt-4 space-y-3">
              {items.map((a) => (
                <li
                  key={a.id}
                  className={`rounded-2xl border p-4 ${a.published ? "border-leaf-300 bg-mist-50" : "border-ink/10 bg-mist-50/60"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.published ? "bg-azure-100 text-azure-800" : "bg-ink/8 text-ink/55"
                      }`}
                    >
                      {a.published ? "Publiée" : "Brouillon"}
                    </span>
                    {a.audience && <span className="text-xs text-ink/50">{a.audience}</span>}
                  </div>
                  <h3 className="mt-2 font-medium text-ink">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{a.summary}</p>
                  {a.internalNote && (
                    <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                      <strong>Note interne :</strong> {a.internalNote}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/8 pt-3">
                    <PublishToggle id={a.id} published={a.published} />
                    <Link
                      href={`/admin/activities/${a.id}/edit`}
                      className="inline-flex min-h-11 items-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/80 active:bg-ink/5"
                    >
                      Modifier
                    </Link>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="rounded-2xl border border-dashed border-ink/15 p-5 text-center text-sm text-ink/45">
                  Aucune activité dans cet axe pour l&apos;instant.
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
