import { redirect } from "next/navigation";
import { CIGIBM_TABS, cigibmHref, type CigibmTab } from "@/lib/cigibm-hub";

// Ancienne adresse du hub : l'espace CIGIBM vit désormais dans le menu Événements.
export default async function OldCigibmHub({ searchParams }: { searchParams: Promise<{ edition?: string; tab?: string }> }) {
  const { edition, tab } = await searchParams;
  const mapped = tab === "public" ? "participants" : tab;
  const n = Number(edition);
  redirect(cigibmHref(Number.isInteger(n) && n > 0 ? n : null, CIGIBM_TABS.includes(mapped as CigibmTab) ? (mapped as CigibmTab) : undefined));
}
