import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import FileUploader from "../FileUploader";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ edition?: string }> }) {
  await requireAdmin();
  const { edition } = await searchParams;
  const n = Number(edition);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/resources" className="text-sm text-leaf-700 underline underline-offset-4">← Dossier ressources</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">Ajouter un fichier</h1>
      <FileUploader defaultEdition={Number.isInteger(n) && n > 0 ? n : undefined} />
    </div>
  );
}
