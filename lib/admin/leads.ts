import { db } from "@/lib/db";

export type LeadRow = {
  id: string;
  fullName: string;
  channel: "email" | "whatsapp";
  email: string | null;
  whatsapp: string | null;
  needsHelp: boolean;
  sourcePath: string | null;
  createdAt: Date;
  contactedAt: Date | null;
};

// À rappeler d'abord : ceux qui demandent de l'aide, puis les plus récents.
// Les personnes déjà contactées descendent en bas de liste.
export async function listLeads(): Promise<LeadRow[]> {
  const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  const rank = (l: LeadRow) => (l.contactedAt ? 2 : l.needsHelp ? 0 : 1);
  return rows.sort((a, b) => rank(a) - rank(b));
}

export async function countLeadsToContact(): Promise<{ total: number; needsHelp: number }> {
  const [total, needsHelp] = await Promise.all([
    db.lead.count({ where: { contactedAt: null } }),
    db.lead.count({ where: { contactedAt: null, needsHelp: true } }),
  ]);
  return { total, needsHelp };
}

export async function setLeadContacted(id: string, contacted: boolean): Promise<void> {
  await db.lead.update({ where: { id }, data: { contactedAt: contacted ? new Date() : null } });
}

// Lien wa.me : chiffres seuls, sans le « + ».
export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
