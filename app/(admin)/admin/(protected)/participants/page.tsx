import { getParticipantsForEdition } from "@/lib/admin/participants";
import { db } from "@/lib/db";
import ParticipantsTable from "./ParticipantsTable";


export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const { edition } = await searchParams;
  const requestedEdition = Number(edition) || 4;
  // Éditions lues en base : une édition créée depuis le hub CIGIBM apparaît ici
  // aussitôt. Toute autre valeur dans l'URL retombe sur l'édition 4 plutôt que
  // de faire planter la page (getParticipantsForEdition lève pour un numéro inconnu).
  const EDITIONS = (await db.edition.findMany({ select: { number: true }, orderBy: { number: "asc" } })).map((e) => e.number);
  const editionNumber = EDITIONS.includes(requestedEdition) ? requestedEdition : 4;
  const result = await getParticipantsForEdition(editionNumber);

  return (
    <div>
      <h1 className="font-display text-2xl text-leaf-900">Participants</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {EDITIONS.map((n) => (
          <a
            key={n}
            href={`/admin/participants?edition=${n}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${
              n === editionNumber ? "border-leaf-600 bg-leaf-600 text-mist-50" : "border-ink/15 text-ink/70"
            }`}
          >
            Édition {n}
          </a>
        ))}
      </div>

      <div className="mt-6">
        {!result.available ? (
          <p className="rounded-xl border border-ink/8 bg-mist-50 p-6 text-sm text-ink/60">
            Données non disponibles pour cette édition.
          </p>
        ) : (
          <ParticipantsTable participants={result.participants} />
        )}
      </div>
    </div>
  );
}
