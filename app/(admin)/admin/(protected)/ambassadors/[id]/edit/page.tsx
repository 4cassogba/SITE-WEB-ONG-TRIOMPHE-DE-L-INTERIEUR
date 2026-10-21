import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { CIGIBM_SPACE, cigibmHref } from "@/lib/cigibm-hub";
import { requireAdmin } from "@/lib/admin/auth";
import { getAmbassador, updateAmbassador } from "@/lib/admin/ambassadors";
import { uploadAmbassadorPhoto } from "@/lib/ambassadors/photo";
import AmbassadorForm from "../../AmbassadorForm";

export default async function EditAmbassadorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { id } = await params;
  const { erreur } = await searchParams;
  const ambassador = await getAmbassador(id);

  if (!ambassador) notFound();

  async function updateAmbassadorAction(formData: FormData) {
    "use server";

    await requireAdmin();

    const fullName = formData.get("fullName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();

    if (!fullName || !phone) {
      redirect(`/admin/ambassadors/${id}/edit?erreur=1`);
    }

    // Le fichier téléversé prend le pas sur l'URL saisie à la main (qui
    // reflète par défaut la photo déjà enregistrée) — un échec d'upload ne
    // doit jamais bloquer l'enregistrement des autres champs.
    const photoFile = formData.get("photo");
    let photoUrl = formData.get("photoUrl")?.toString().trim() || null;
    if (photoFile instanceof File && photoFile.size > 0) {
      try {
        photoUrl = await uploadAmbassadorPhoto(photoFile);
      } catch (err) {
        console.error("Admin ambassador photo upload failed, keeping the existing value", err);
      }
    }

    await updateAmbassador(id, {
      fullName,
      phone,
      whatsappNumber: formData.get("whatsappNumber")?.toString().trim() || null,
      email: formData.get("email")?.toString().trim() || null,
      photoUrl,
      bio: formData.get("bio")?.toString().trim() || null,
      active: formData.get("active") === "on",
    });

    revalidatePath(CIGIBM_SPACE);
    redirect(cigibmHref(null, "ambassadeurs"));
  }

  return (
    <div>
      <Link href={cigibmHref(null, "ambassadeurs")} className="text-sm text-leaf-700 underline underline-offset-4">← Ambassadeurs du CIGIBM</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900">Modifier {ambassador.fullName}</h1>
      {erreur && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          Le nom et le téléphone sont obligatoires.
        </p>
      )}
      <div className="mt-6">
        <AmbassadorForm
          ambassador={ambassador}
          action={updateAmbassadorAction}
          submitLabel="Enregistrer"
          showActiveToggle={true}
        />
      </div>
    </div>
  );
}
