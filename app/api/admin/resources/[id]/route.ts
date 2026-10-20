import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource, signedFileUrl } from "@/lib/admin/resources";

// Téléchargement d'un fichier du dossier ressources : réservé aux admins,
// délivré par une URL signée valable 60 secondes.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource?.filePath || !resource.fileName) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  const url = await signedFileUrl(resource.filePath, { seconds: 60, downloadAs: resource.fileName });
  if (!url) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.redirect(url);
}
