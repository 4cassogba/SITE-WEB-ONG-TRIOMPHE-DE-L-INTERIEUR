import { redirect } from "next/navigation";
import { cigibmHref } from "@/lib/cigibm-hub";

// La liste des participants est un onglet de l'espace CIGIBM (menu Événements).
export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ edition?: string }> }) {
  const { edition } = await searchParams;
  const n = Number(edition);
  redirect(cigibmHref(Number.isInteger(n) && n > 0 ? n : null, "participants"));
}
