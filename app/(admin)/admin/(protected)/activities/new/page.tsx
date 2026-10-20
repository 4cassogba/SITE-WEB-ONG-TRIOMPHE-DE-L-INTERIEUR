import ActivityForm from "../ActivityForm";
import { createActivityAction } from "../actions";

export default function NewActivityPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-leaf-900">Nouvelle activité</h1>
      <ActivityForm action={createActivityAction} submitLabel="Créer l'activité" />
    </div>
  );
}
