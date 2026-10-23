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

// Mots courts, sans accent ni majuscule : faciles à dicter à une hôtesse le jour
// du congrès et à taper sur un téléphone.
const WORDS = [
  "soleil", "mangue", "lagune", "palmier", "baobab", "colibri", "riviere", "savane", "pirogue", "tambour",
  "ananas", "papaye", "goyave", "citron", "orange", "banane", "cocotier", "jasmin", "hibiscus", "lotus",
  "plage", "vague", "sable", "nuage", "etoile", "lune", "aurore", "brise", "orage", "pluie",
  "jardin", "marche", "village", "colline", "foret", "chemin", "pont", "phare", "port", "ile",
  "lion", "zebre", "girafe", "tortue", "dauphin", "aigle", "hibou", "abeille", "papillon", "panthere",
  "perle", "ambre", "corail", "jade", "rubis", "saphir", "cristal", "bronze", "argent", "cuivre",
  "violon", "guitare", "kora", "balafon", "chanson", "danse", "rythme", "melodie", "tam", "flute",
  "lumiere", "espoir", "courage", "sagesse", "victoire", "racine", "graine", "fleur", "feuille", "arbre",
  "matin", "midi", "soir", "saison", "voyage", "sourire", "lettre", "livre", "plume", "crayon",
  "bateau", "velo", "train", "avion", "fusee", "boussole", "carte", "lanterne", "miroir", "horloge",
] as const;

function word(): string {
  return WORDS[randomInt(0, WORDS.length)];
}

// Scanner : deux mots + 3 chiffres (≈ 10 millions de combinaisons), assez simple
// pour être dicté. Administrateur : trois mots + 2 chiffres (≈ 100 millions), car
// ce compte ouvre tout l'admin. Tirage par crypto.randomInt, jamais Math.random.
export function generatePassword(role: "scanner" | "admin" = "scanner"): string {
  return role === "admin" ? `${word()}-${word()}-${word()}-${randomInt(10, 100)}` : `${word()}-${word()}-${randomInt(100, 1000)}`;
}
