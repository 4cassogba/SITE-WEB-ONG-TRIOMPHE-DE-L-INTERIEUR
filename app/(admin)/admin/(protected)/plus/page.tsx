import { AdminMoreMenu } from "../AdminNav";

export default function MorePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl text-leaf-900">Tout l&apos;admin</h1>
      <p className="mt-1 text-sm text-ink/60">Rangé par métier.</p>
      <div className="mt-6">
        <AdminMoreMenu />
      </div>
    </div>
  );
}
