import { randomInt } from "node:crypto";

export type TeamLine = { fullName: string; email?: string };

// Une ligne = "Nom complet" ou "Nom complet, email". Les lignes vides sont ignorées.
export function parseTeamLines(text: string): TeamLine[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, email] = line.split(/[,;\t]/).map((part) => part.trim());
      return { fullName: name, email: email || undefined };
    })
    .filter((l) => l.fullName);
}

// Le suffixe aléatoire évite qu'un email généré tombe sur le compte existant
// d'une homonyme, ce qui lui attribuerait le rôle par erreur.
export function generateScannerEmail(fullName: string, domain: string): string {
  const slug = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug}.${randomInt(100, 1000)}@${domain}`;
}

export function generatePassword(): string {
  return `scan${randomInt(10000, 100000)}`;
}
