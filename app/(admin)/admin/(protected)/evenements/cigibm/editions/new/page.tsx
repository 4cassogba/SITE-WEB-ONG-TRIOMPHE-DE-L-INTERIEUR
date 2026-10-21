import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listEditions } from "@/lib/admin/cigibm";
import EditionForm from "../../EditionForm";
import { createEditionAction } from "../../actions";

export default async function NewEditionPage() {
  await requireAdmin();
  const editions = await listEditions();
  const next = editions.length ? Math.max(...editions.map((e) => e.number)) + 1 : 1;
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/evenements/cigibm" className="text-sm text-leaf-700 underline underline-offset-4">← CIGIBM</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">Nouvelle édition</h1>
      <EditionForm action={createEditionAction} initial={{ number: String(next), theme: "", dates: "", venue: "", eventDate: "" }} submitLabel="Créer l'édition" />
    </div>
  );
}
