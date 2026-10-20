import { listLeads, whatsappLink } from "@/lib/admin/leads";
import ContactedButton from "./ContactedButton";

const TZ = "Africa/Porto-Novo";

export default async function LeadsPage() {
  const leads = await listLeads();
  const toContact = leads.filter((l) => !l.contactedAt).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Contacts à rappeler</h1>
      <p className="mt-1 text-sm text-ink/60">
        Personnes qui ont laissé leurs coordonnées via le pop-up bien-être mental. {toContact} à contacter sur {leads.length}.
      </p>

      <ul className="mt-6 space-y-3">
        {leads.map((l) => {
          const contacted = l.contactedAt !== null;
          const href = l.channel === "whatsapp" && l.whatsapp ? whatsappLink(l.whatsapp) : `mailto:${l.email}`;
          const value = l.channel === "whatsapp" ? l.whatsapp : l.email;
          return (
            <li key={l.id} className={`rounded-2xl border p-4 ${contacted ? "border-ink/8 bg-mist-50/60" : l.needsHelp ? "border-amber-400 bg-amber-50/60" : "border-ink/8 bg-mist-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate font-medium ${contacted ? "text-ink/50" : "text-ink"}`}>{l.fullName}</p>
                  <a
                    href={href}
                    target={l.channel === "whatsapp" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-sm font-semibold text-leaf-700 underline underline-offset-4"
                  >
                    {l.channel === "whatsapp" ? "WhatsApp · " : "Email · "}
                    {value}
                  </a>
                  <p className="mt-1 text-xs text-ink/45">
                    {l.createdAt.toLocaleString("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    {l.sourcePath ? ` · depuis ${l.sourcePath}` : ""}
                    {contacted ? ` · contacté le ${l.contactedAt!.toLocaleDateString("fr-FR", { timeZone: TZ })}` : ""}
                  </p>
                </div>
                {l.needsHelp && !contacted && (
                  <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">Veut de l&apos;aide</span>
                )}
              </div>
              <div className="mt-3 border-t border-ink/8 pt-3">
                <ContactedButton id={l.id} contacted={contacted} />
              </div>
            </li>
          );
        })}
        {leads.length === 0 && (
          <li className="rounded-2xl border border-ink/8 bg-mist-50 p-6 text-center text-sm text-ink/50">Aucun contact pour l&apos;instant.</li>
        )}
      </ul>
    </div>
  );
}
