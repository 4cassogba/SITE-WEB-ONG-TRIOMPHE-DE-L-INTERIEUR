import Link from "next/link";
import { cigibmHref } from "@/lib/cigibm-hub";
import ComposeForm from "./ComposeForm";

export default function ComposeMessagePage() {
  return (
    <div>
      <Link href={cigibmHref(null, "communication")} className="text-sm text-leaf-700 underline underline-offset-4">← Communication du CIGIBM</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900">Nouveau message</h1>
      <div className="mt-6">
        <ComposeForm />
      </div>
    </div>
  );
}
