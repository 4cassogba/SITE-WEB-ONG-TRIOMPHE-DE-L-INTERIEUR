import type { Metadata, Viewport } from "next";
import { requireScanAccess } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScannerClient from "./ScannerClient";

export const metadata: Metadata = {
  title: "Scanner, Admin",
  robots: { index: false },
};

// viewport-fit=cover : sans lui, iOS n'expose pas env(safe-area-inset-*) et la
// feuille de résultat fixée en bas passerait sous la barre d'accueil de l'iPhone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e2118",
};

export default async function ScanPage() {
  const session = await requireScanAccess();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-leaf-950 px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-mist-50">
      <header className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.12em] text-leaf-300">Entrée CIGIBM</p>
          <p className="truncate text-sm text-mist-50/70">{session.fullName}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="min-h-11 rounded-full border border-mist-50/20 px-4 text-sm text-mist-50/80 active:bg-mist-50/10"
          >
            Déconnexion
          </button>
        </form>
      </header>
      <ScannerClient />
    </div>
  );
}
