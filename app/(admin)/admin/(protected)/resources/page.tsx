import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listResources } from "@/lib/admin/resources";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS, fileKindLabel, type ResourceCategoryKey } from "@/lib/resources-meta";

const TZ = "Africa/Porto-Novo";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  await requireAdmin();
  const { cat } = await searchParams;
  const category = RESOURCE_CATEGORIES.includes(cat as ResourceCategoryKey) ? (cat as ResourceCategoryKey) : undefined;

  let resources: Awaited<ReturnType<typeof listResources>> = [];
  let failed = false;
  try {
    resources = await listResources({ category });
  } catch (err) {
    console.error("listResources failed", err);
    failed = true;
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium ${active ? "border-leaf-700 bg-leaf-700 text-mist-50" : "border-ink/12 bg-mist-50 text-ink/70"}`;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Dossier ressources</h1>
      <p className="mt-1 text-sm text-ink/60">
        Documents internes, visibles seulement par les administrateurs connectés. Les notes se lisent et se modifient ici ; les fichiers s&apos;ouvrent dans la page.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/resources/new" className="inline-flex min-h-12 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50">+ Nouvelle note</Link>
        <Link href="/admin/resources/upload" className="inline-flex min-h-12 items-center rounded-full border border-leaf-600 px-5 text-sm font-bold text-leaf-700">+ Ajouter un fichier</Link>
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href="/admin/resources" className={chip(!category)}>Tout</Link>
        {RESOURCE_CATEGORIES.map((c) => (
          <Link key={c} href={`/admin/resources?cat=${c}`} className={chip(category === c)}>{RESOURCE_CATEGORY_LABELS[c]}</Link>
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {resources.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/resources/${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-mist-50 p-4 transition-colors active:bg-leaf-50 sm:hover:border-leaf-300">
              <span className="min-w-0">
                <span className="block break-words font-medium text-ink">{r.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/50">
                  <span className="rounded-full bg-leaf-100 px-2 py-0.5 font-semibold text-leaf-800">{r.kind === "note" ? "Note" : fileKindLabel(r.fileName ?? "")}</span>
                  <span>{RESOURCE_CATEGORY_LABELS[r.category]}</span>
                  {r.editionNumber && <span>· Édition {r.editionNumber}</span>}
                  {r.kind === "file" && r.sizeBytes ? <span>· {formatSize(r.sizeBytes)}</span> : null}
                  <span>· {r.updatedAt.toLocaleDateString("fr-FR", { timeZone: TZ })}{r.updatedByName ? ` · ${r.updatedByName}` : ""}</span>
                </span>
              </span>
              <span aria-hidden className="shrink-0 text-xl text-leaf-700">›</span>
            </Link>
          </li>
        ))}
        {failed && <li className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center text-sm text-red-700">Impossible de charger les documents pour le moment.</li>}
        {!failed && resources.length === 0 && <li className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/50">Aucun document ici pour l&apos;instant.</li>}
      </ul>
    </div>
  );
}
