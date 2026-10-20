import { notFound } from "next/navigation";
import { getActivity } from "@/lib/admin/activities";
import ActivityForm from "../../ActivityForm";
import DeleteActivityButton from "./DeleteActivityButton";
import { updateActivityAction } from "../../actions";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-leaf-900">Modifier l&apos;activité</h1>
      <ActivityForm action={updateActivityAction.bind(null, id)} initial={activity} submitLabel="Enregistrer" />
      <div className="mt-10 max-w-xl border-t border-ink/10 pt-6">
        <DeleteActivityButton id={id} title={activity.title} />
      </div>
    </div>
  );
}
