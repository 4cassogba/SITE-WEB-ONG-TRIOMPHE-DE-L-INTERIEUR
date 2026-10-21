import { redirect } from "next/navigation";
import { cigibmHref } from "@/lib/cigibm-hub";

// Les ambassadeurs sont un onglet de l'espace CIGIBM (menu Événements). L'adresse
// reste valable : elle figure dans les emails de validation des candidatures.
export default function AmbassadorsPage() {
  redirect(cigibmHref(null, "ambassadeurs"));
}
