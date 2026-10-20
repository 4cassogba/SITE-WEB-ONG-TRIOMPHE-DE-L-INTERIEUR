import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { findTemplate } from "@/lib/note-templates";
import NoteEditor from "../NoteEditor";
import { createNoteAction } from "../actions";

export default async function NewNotePage({ searchParams }: { searchParams: Promise<{ edition?: string; template?: string }> }) {
  await requireAdmin();
  const { edition, template } = await searchParams;
  const editionNumber = Number(edition);
  const linked = Number.isInteger(editionNumber) && editionNumber > 0 ? editionNumber : null;
  const tpl = linked ? findTemplate(template) : undefined;
  const back = linked ? `/admin/cigibm?edition=${linked}&tab=documents` : "/admin/resources";
  return (
    <div className="mx-auto max-w-5xl">
      <Link href={back} className="text-sm text-leaf-700 underline underline-offset-4">← Retour</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">{tpl ? `Nouvelle note : ${tpl.label.toLowerCase()}` : "Nouvelle note"}</h1>
      <NoteEditor
        action={createNoteAction}
        initial={{ title: tpl && linked ? tpl.title(linked) : "", category: linked ? "cigibm" : "autre", editionNumber: linked, body: tpl?.body ?? "" }}
        submitLabel="Créer la note"
        cancelHref={back}
      />
    </div>
  );
}
