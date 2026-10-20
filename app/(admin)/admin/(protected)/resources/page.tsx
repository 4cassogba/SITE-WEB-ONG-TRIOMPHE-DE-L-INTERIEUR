import { requireAdmin } from "@/lib/admin/auth";
import { listResources, type Resource } from "@/lib/admin/resources";

const TZ = "Africa/Porto-Novo";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

function kind(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pptx") return "PowerPoint";
  if (ext === "docx") return "Word";
  if (ext === "xlsx") return "Excel";
  if (ext === "pdf") return "PDF";
  return ext?.toUpperCase() ?? "Fichier";
}

export default async function ResourcesPage() {
  await requireAdmin();
  let resources: Resource[] = [];
  let failed = false;
  try {
    resources = await listResources();
  } catch (err) {
    console.error("listResources failed", err);
    failed = true;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Dossier ressources</h1>
      <p className="mt-1 text-sm text-ink/60">
        Documents internes de l&apos;ONG, visibles seulement par les administrateurs connectés. Aucun lien public.
      </p>

      <ul className="mt-6 space-y-3">
        {resources.map((r) => (
          <li key={r.name} className="rounded-2xl border border-ink/8 bg-mist-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-ink">{r.name}</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {kind(r.name)} · {formatSize(r.size)}
                  {r.updatedAt ? ` · ${r.updatedAt.toLocaleDateString("fr-FR", { timeZone: TZ })}` : ""}
                </p>
              </div>
              <a
                href={`/api/admin/resources/${encodeURIComponent(r.name)}`}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50"
              >
                Télécharger
              </a>
            </div>
          </li>
        ))}
        {failed && (
          <li className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center text-sm text-red-700">
            Impossible de charger les documents pour le moment.
          </li>
        )}
        {!failed && resources.length === 0 && (
          <li className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/50">Aucun document pour l&apos;instant.</li>
        )}
      </ul>
    </div>
  );
}
