import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export type LeadInput = {
  fullName: string;
  channel: "email" | "whatsapp";
  contact: string;
  needsHelp?: boolean;
  sourcePath?: string;
};

export type LeadValidation = { ok: true; value: Required<Omit<LeadInput, "sourcePath">> & { sourcePath: string | null } } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Numéros béninois à 8 chiffres (ancien format) : le 01 est requis depuis
// 2024 pour que WhatsApp reconnaisse le numéro.
export function normalizeWhatsApp(raw: string): string | null {
  let phone = normalizePhone(raw.trim());
  if (/^\+229\d{8}$/.test(phone)) phone = `+22901${phone.slice(4)}`;
  return /^\+\d{9,15}$/.test(phone) ? phone : null;
}

export function validateLead(input: LeadInput): LeadValidation {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  if (fullName.length < 2 || fullName.length > 100) return { ok: false, error: "Indiquez votre prénom et votre nom." };

  const contactRaw = input.contact.trim();
  if (input.channel === "email") {
    if (contactRaw.length > 160 || !EMAIL_PATTERN.test(contactRaw)) return { ok: false, error: "Cet email ne semble pas valide." };
    return { ok: true, value: { fullName, channel: "email", contact: contactRaw.toLowerCase(), needsHelp: !!input.needsHelp, sourcePath: cleanPath(input.sourcePath) } };
  }

  const phone = normalizeWhatsApp(contactRaw);
  if (!phone) return { ok: false, error: "Ce numéro WhatsApp ne semble pas valide." };
  return { ok: true, value: { fullName, channel: "whatsapp", contact: phone, needsHelp: !!input.needsHelp, sourcePath: cleanPath(input.sourcePath) } };
}

function cleanPath(path?: string) {
  return path && path.startsWith("/") ? path.slice(0, 200) : null;
}

// Une même personne qui se réinscrit (autre appareil, visite suivante) ne crée
// pas de doublon ; si elle coche « besoin d'aide » cette fois, on le retient.
export async function createLead(input: LeadInput): Promise<{ status: "created" | "existing" } | { status: "invalid"; error: string }> {
  const checked = validateLead(input);
  if (!checked.ok) return { status: "invalid", error: checked.error };
  const { fullName, channel, contact, needsHelp, sourcePath } = checked.value;

  const existing = await db.lead.findFirst({
    where: channel === "email" ? { email: { equals: contact, mode: "insensitive" } } : { whatsapp: contact },
  });
  if (existing) {
    if (needsHelp && !existing.needsHelp) await db.lead.update({ where: { id: existing.id }, data: { needsHelp: true, contactedAt: null } });
    return { status: "existing" };
  }

  await db.lead.create({
    data: {
      fullName,
      channel,
      email: channel === "email" ? contact : null,
      whatsapp: channel === "whatsapp" ? contact : null,
      needsHelp,
      sourcePath,
    },
  });
  return { status: "created" };
}
