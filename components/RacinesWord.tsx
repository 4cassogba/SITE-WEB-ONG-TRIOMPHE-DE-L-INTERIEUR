import Reveal from "./Reveal";

// « RACINES » en grand : une lettre par colonne, son mot dessous. Les sept
// colonnes restent toujours sur une seule ligne : la taille des lettres suit la
// largeur de l'écran (clamp sur vw), et sur téléphone les mots s'écrivent à la
// verticale (sinon « Neutraliser » ne tiendrait pas dans ~45 px).
// Un seul effet d'apparition pour tout le bloc : par colonne, le R et le S, collés
// aux bords de l'écran, ne franchissaient jamais le seuil de déclenchement
// (marge de -80 px) et restaient invisibles sur téléphone.
export default function RacinesWord({
  steps,
}: {
  steps: { letter: string; title: string }[];
}) {
  return (
    <Reveal>
      <div
        role="list"
        aria-label="La méthode R.A.C.I.N.E.S. : Reconnaître, Accepter, Comprendre, Intégrer, Neutraliser, Engager, Solidifier"
        className="rounded-3xl border border-ink/8 bg-mist-50 px-1.5 py-8 shadow-sm shadow-ink/5 sm:px-6 sm:py-12"
      >
        <div className="grid grid-cols-7">
          {steps.map((step) => (
            <div key={step.letter} className="min-w-0">
              <div role="listitem" className="flex flex-col items-center">
                <span
                  aria-hidden
                  className="bg-gradient-to-b from-leaf-400 to-leaf-700 bg-clip-text font-display text-[clamp(2.1rem,12.5vw,6.5rem)] font-semibold leading-none text-transparent"
                >
                  {step.letter}
                </span>
                <span
                  aria-hidden
                  className="mt-2 h-4 w-px bg-leaf-300 sm:mt-3 sm:h-7"
                />
                <span className="mt-2 text-[0.8rem] font-semibold leading-none tracking-wide text-leaf-900 [writing-mode:vertical-rl] sm:mt-3 sm:text-[0.7rem] sm:[writing-mode:horizontal-tb] md:text-sm lg:text-base">
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
