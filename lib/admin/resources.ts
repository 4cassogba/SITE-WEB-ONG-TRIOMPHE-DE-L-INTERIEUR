import { createAdminClient } from "@/lib/supabase/admin";

// Bucket privé : jamais d'URL publique. Les fichiers ne sortent que par une
// URL signée de courte durée, délivrée à un admin connecté (voir
// app/api/admin/resources/[name]/route.ts).
export const RESOURCES_BUCKET = "ressources";
const SIGNED_URL_SECONDS = 60;

export type Resource = { name: string; size: number; updatedAt: Date | null };

export async function listResources(): Promise<Resource[]> {
  const { data, error } = await createAdminClient().storage.from(RESOURCES_BUCKET).list("", {
    limit: 200,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.id) // les « dossiers » n'ont pas d'id
    .map((f) => ({
      name: f.name,
      size: Number(f.metadata?.size ?? 0),
      updatedAt: f.updated_at ? new Date(f.updated_at) : null,
    }));
}

export async function signedResourceUrl(name: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .storage.from(RESOURCES_BUCKET)
    .createSignedUrl(name, SIGNED_URL_SECONDS, { download: name });
  return error ? null : data.signedUrl;
}
