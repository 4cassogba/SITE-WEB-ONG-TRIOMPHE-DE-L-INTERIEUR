import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { listPublishedActivities } from "@/lib/admin/activities";
import { ACTIVITY_AXES, AXIS_LABELS } from "@/lib/activities-meta";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nos activités",
  description:
    "Les activités de l'ONG Triomphe de l'Intérieur : soutien aux personnes vulnérables, accompagnement des femmes et des jeunes vers la guérison intérieure et le bien-être mental, autonomisation.",
  path: "/activites",
});

// Page statique régénérée toutes les minutes : une activité publiée dans l'admin
// apparaît ici au plus tard 60 s plus tard (et tout de suite après la
// publication, grâce à revalidatePath dans l'action).
export const revalidate = 60;

export default async function ActivitesPage() {
  let activities: Awaited<ReturnType<typeof listPublishedActivities>> = [];
  try {
    activities = await listPublishedActivities();
  } catch (err) {
    console.error("listPublishedActivities failed", err);
  }

  return (
    <>
      <Hero
        compact
        eyebrow="Ce que nous faisons"
        title="Nos activités"
        description="Trois axes, une même ambition : accompagner les personnes là où elles en ont besoin, et leur donner les moyens de tenir debout."
      />

      <Container className="py-20 sm:py-24">
        {activities.length === 0 && (
          <p className="mx-auto max-w-xl rounded-2xl border border-ink/8 bg-mist-50 p-8 text-center text-ink/70">
            Nos activités seront détaillées ici très bientôt.
          </p>
        )}

        {ACTIVITY_AXES.map((axis) => {
          const items = activities.filter((a) => a.axis === axis);
          if (items.length === 0) return null;
          return (
            <section key={axis} className="mb-16 last:mb-0">
              <Reveal>
                <h2 className="font-display text-2xl text-leaf-900 sm:text-3xl">{AXIS_LABELS[axis].title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{AXIS_LABELS[axis].statutory}</p>
              </Reveal>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {items.map((a) => (
                  <Reveal key={a.id}>
                    <article className="flex h-full flex-col rounded-2xl border border-ink/8 bg-mist-50 p-6 shadow-sm shadow-ink/5">
                      {a.status !== "en_cours" && (
                        <span
                          className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                            a.status === "en_projet" ? "bg-amber-100 text-amber-900" : "bg-ink/8 text-ink/60"
                          }`}
                        >
                          {a.status === "en_projet" ? "Bientôt" : "Terminée"}
                        </span>
                      )}
                      <h3 className="font-display text-xl text-leaf-900">{a.title}</h3>
                      {a.audience && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf-600">{a.audience}</p>}
                      <p className="mt-3 text-sm leading-relaxed text-ink/75">{a.summary}</p>
                      {a.href &&
                        (a.href.startsWith("/") ? (
                          <Link href={a.href} className="mt-auto pt-5 text-sm font-semibold text-leaf-700 underline decoration-leaf-300 underline-offset-4 hover:text-leaf-900">
                            En savoir plus →
                          </Link>
                        ) : (
                          <a href={a.href} target="_blank" rel="noopener noreferrer" className="mt-auto pt-5 text-sm font-semibold text-leaf-700 underline decoration-leaf-300 underline-offset-4 hover:text-leaf-900">
                            En savoir plus →
                          </a>
                        ))}
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </>
  );
}
