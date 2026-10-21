import { redirect } from "next/navigation";
import { cigibmHref } from "@/lib/cigibm-hub";

// L'historique des envois est dans l'onglet Communication de l'espace CIGIBM.
export default function MessagesPage() {
  redirect(cigibmHref(null, "communication"));
}
