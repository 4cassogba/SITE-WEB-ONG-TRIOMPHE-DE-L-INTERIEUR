import { phaseLabel, type EditionPhase } from "@/lib/cigibm-hub";

// Statut d'une édition (« J-12 », « C'est aujourd'hui », « Terminée il y a 4 jours »).
export default function PhasePill({ phase, dark = false }: { phase: EditionPhase; dark?: boolean }) {
  const tone =
    phase.kind === "today"
      ? "bg-amber-400 text-leaf-950"
      : phase.kind === "upcoming"
        ? dark
          ? "bg-leaf-300 text-leaf-950"
          : "bg-leaf-100 text-leaf-800"
        : dark
          ? "bg-mist-50/12 text-mist-50"
          : "bg-ink/6 text-ink/65";
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{phaseLabel(phase)}</span>;
}
