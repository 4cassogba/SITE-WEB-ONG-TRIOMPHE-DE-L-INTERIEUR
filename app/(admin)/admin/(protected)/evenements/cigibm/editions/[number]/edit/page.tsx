import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getEdition } from "@/lib/admin/cigibm";
import { cigibmHref, editionPhase, isEditionLocked, toDateInput } from "@/lib/cigibm-hub";
import EditionForm from "../../../EditionForm";
import { updateEditionAction } from "../../../actions";

export default async function EditEditionPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const { number } = await params;
  const n = Number(number);
  const edition = await getEdition(n);
  if (!edition) notFound();
  // Une édition terminée est archivée : retour à son espace, en lecture seule.
  if (isEditionLocked(editionPhase(edition.eventDate, new Date()))) redirect(cigibmHref(n));
  return (
    <div className="mx-auto max-w-3xl">
      <Link href={cigibmHref(n)} className="text-sm text-leaf-700 underline underline-offset-4">← CIGIBM</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">Modifier l&apos;édition {n}</h1>
      <EditionForm
        action={updateEditionAction.bind(null, n)}
        initial={{ number: String(n), theme: edition.theme, dates: edition.dates, venue: edition.venue, eventDate: toDateInput(edition.eventDate) }}
        submitLabel="Enregistrer"
        lockNumber
      />
    </div>
  );
}
