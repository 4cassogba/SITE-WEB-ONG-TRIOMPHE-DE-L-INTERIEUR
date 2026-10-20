import type { Metadata } from "next";
import { Cigibm5Hero } from "@/components/Cigibm5Teaser";
import { pageMetadata } from "@/lib/seo";

// Page de partage : une seule scène plein écran, pensée pour être envoyée par
// lien (WhatsApp, réseaux) ou filmée telle quelle en vidéo verticale.
export const metadata: Metadata = pageMetadata({
  title: "CIGIBM 5ème édition : chut, ça se prépare",
  description: "La 5ème édition du CIGIBM arrive. Date et lieu dévoilés très bientôt sur la page du congrès.",
  path: "/cigibm/5e-edition",
});

export default function Cigibm5eEditionPage() {
  return <Cigibm5Hero fullScreen />;
}
