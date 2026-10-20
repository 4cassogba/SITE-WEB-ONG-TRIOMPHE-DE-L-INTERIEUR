import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { signedResourceUrl } from "@/lib/admin/resources";

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  await requireAdmin();
  const { name } = await params;
  // Pas de sous-dossier ni de remontée de chemin : un nom de fichier simple.
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }
  const url = await signedResourceUrl(name);
  if (!url) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.redirect(url);
}
