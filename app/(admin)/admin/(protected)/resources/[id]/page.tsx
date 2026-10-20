import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource, signedFileUrl } from "@/lib/admin/resources";
import { RESOURCE_CATEGORY_LABELS, fileKindLabel, previewModeFor } from "@/lib/resources-meta";
import MarkdownView from "../MarkdownView";
import OfficePreview from "../OfficePreview";
import DeleteResourceButton from "./DeleteResourceButton";

const TZ = "Africa/Porto-Novo";

async function TextFilePreview({ url }: { url: string }) {
  const res = await fetch(url, { cache: "no-store" });
  const text = res.ok ? (await res.text()).slice(0, 200_000) : "Impossible de lire ce fichier.";
  return <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-ink/10 bg-mist-50 p-4 text-[13px] leading-relaxed">{text}</pre>;
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const mode = resource.kind === "file" && resource.fileName ? previewModeFor(resource.fileName) : "none";
  // PDF, images et texte : lien signé de 10 minutes, affiché directement.
  const inlineUrl = resource.filePath && ["pdf", "image", "text"].includes(mode) ? await signedFileUrl(resource.filePath, { seconds: 600 }) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/resources" className="text-sm text-leaf-700 underline underline-offset-4">← Dossier ressources</Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-words font-display text-2xl text-leaf-900 sm:text-3xl">{resource.title}</h1>
          <p className="mt-1 text-xs text-ink/50">
            {resource.kind === "note" ? "Note" : fileKindLabel(resource.fileName ?? "")} · {RESOURCE_CATEGORY_LABELS[resource.category]}
            {resource.editionNumber ? ` · Édition ${resource.editionNumber}` : ""} · modifié le {resource.updatedAt.toLocaleDateString("fr-FR", { timeZone: TZ })}
            {resource.updatedByName ? ` par ${resource.updatedByName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/resources/${resource.id}/edit`} className="inline-flex min-h-11 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50">
            {resource.kind === "note" ? "Modifier" : "Gérer"}
          </Link>
          {resource.kind === "file" && (
            <a href={`/api/admin/resources/${resource.id}`} className="inline-flex min-h-11 items-center rounded-full border border-leaf-600 px-5 text-sm font-bold text-leaf-700">Télécharger</a>
          )}
        </div>
      </div>

      <div className="mt-6">
        {resource.kind === "note" && (
          <article className="rounded-2xl border border-ink/8 bg-mist-50 p-5 sm:p-8">
            {resource.body?.trim() ? <MarkdownView source={resource.body} /> : <p className="text-sm text-ink/50">Cette note est vide. Cliquez sur « Modifier » pour la rédiger.</p>}
          </article>
        )}
        {resource.kind === "file" && mode === "pdf" && inlineUrl && <iframe title={resource.title} src={inlineUrl} className="h-[75vh] min-h-[30rem] w-full rounded-2xl border border-ink/10 bg-mist-50" />}
        {resource.kind === "file" && mode === "image" && inlineUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inlineUrl} alt={resource.title} className="mx-auto max-h-[75vh] rounded-2xl border border-ink/10" />
        )}
        {resource.kind === "file" && mode === "text" && inlineUrl && <TextFilePreview url={inlineUrl} />}
        {resource.kind === "file" && mode === "office" && <OfficePreview id={resource.id} />}
        {resource.kind === "file" && mode === "none" && (
          <p className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/60">Ce format ne peut pas être affiché ici. Utilisez « Télécharger ».</p>
        )}
      </div>

      <div className="mt-10 border-t border-ink/8 pt-5">
        <DeleteResourceButton id={resource.id} />
      </div>
    </div>
  );
}
