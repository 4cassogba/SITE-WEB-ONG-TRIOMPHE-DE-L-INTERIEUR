import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/cigibm-hub";
import EditionForm from "../../../EditionForm";
import { updateEditionAction } from "../../../actions";

export default async function EditEditionPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const { number } = await params;
  const n = Number(number);
  const edition = Number.isInteger(n) ? await db.edition.findUnique({ where: { number: n } }) : null;
  if (!edition) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/admin/cigibm?edition=${n}`} className="text-sm text-leaf-700 underline underline-offset-4">← Hub CIGIBM</Link>
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
