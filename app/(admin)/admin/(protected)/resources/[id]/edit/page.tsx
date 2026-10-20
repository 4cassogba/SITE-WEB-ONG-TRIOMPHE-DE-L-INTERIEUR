import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource } from "@/lib/admin/resources";
import NoteEditor from "../../NoteEditor";
import FileUploader from "../../FileUploader";
import MetaOnlyForm from "../../MetaOnlyForm";
import { updateFileMetaAction, updateNoteAction } from "../../actions";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await getResource(id);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/admin/resources/${id}`} className="text-sm text-leaf-700 underline underline-offset-4">← Retour au document</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">{r.kind === "note" ? "Modifier la note" : "Gérer le fichier"}</h1>

      {r.kind === "note" ? (
        <NoteEditor
          action={updateNoteAction.bind(null, id)}
          initial={{ title: r.title, category: r.category, editionNumber: r.editionNumber, body: r.body ?? "" }}
          submitLabel="Enregistrer"
          cancelHref={`/admin/resources/${id}`}
        />
      ) : (
        <div className="max-w-xl">
          <MetaOnlyForm action={updateFileMetaAction.bind(null, id)} title={r.title} category={r.category} editionNumber={r.editionNumber} />
          <h2 className="mt-10 font-display text-xl text-leaf-900">Remplacer par une nouvelle version</h2>
          <p className="mt-1 text-sm text-ink/60">
            Les fichiers Office ne se modifient pas dans le navigateur : modifiez-le sur votre ordinateur puis envoyez la nouvelle version ici. L&apos;ancienne est supprimée.
          </p>
          <FileUploader replaceId={id} />
        </div>
      )}
    </div>
  );
}
