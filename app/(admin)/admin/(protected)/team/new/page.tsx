import NewTeamForm from "./NewTeamForm";

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-leaf-900">Ajouter des hôtesses / membres</h1>
      <p className="mt-2 max-w-xl text-sm text-ink/60">
        Un compte « Scanner » n&apos;a accès qu&apos;à l&apos;écran de scan des badges, jamais au reste de l&apos;admin.
      </p>
      <NewTeamForm />
    </div>
  );
}
