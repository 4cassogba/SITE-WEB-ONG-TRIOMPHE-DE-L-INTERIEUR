"use client";

import { useSearchParams } from "next/navigation";
import AmbassadorSuccessPopup from "./AmbassadorSuccessPopup";

// Lit le retour d'inscription ambassadeur (?ambassadeur=succes|existant|erreur)
// côté navigateur : la page /cigibm peut ainsi rester statique et mise en
// cache (lire searchParams côté serveur la rendait dynamique, donc lente).
export default function AmbassadorFeedback({ part, phone }: { part: "popup" | "error"; phone: string }) {
  const params = useSearchParams();
  const status = params.get("ambassadeur");
  const ref = params.get("ref");

  if (part === "popup") {
    if (status === "succes" && ref) return <AmbassadorSuccessPopup slug={ref} />;
    if (status === "existant" && ref) return <AmbassadorSuccessPopup slug={ref} alreadyExists />;
    return null;
  }

  if (status !== "erreur") return null;
  return (
    <p className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
      Une erreur est survenue, votre inscription n&apos;a pas pu être enregistrée. Réessayez, ou appelez le {phone}.
    </p>
  );
}
