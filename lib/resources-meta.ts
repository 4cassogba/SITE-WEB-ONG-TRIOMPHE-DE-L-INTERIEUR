export const RESOURCE_CATEGORIES = ["cigibm", "ong", "institutionnel", "communication", "autre"] as const;
export type ResourceCategoryKey = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategoryKey, string> = {
  cigibm: "CIGIBM",
  ong: "Vie de l'ONG",
  institutionnel: "Institutionnel",
  communication: "Communication",
  autre: "Autre",
};

export const MAX_FILE_BYTES = 25 * 1024 * 1024;

// Formats acceptés à l'envoi : bureautique, PDF, images, texte.
export const ALLOWED_EXTENSIONS = ["pdf", "docx", "pptx", "xlsx", "csv", "txt", "md", "png", "jpg", "jpeg", "webp"] as const;

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export type PreviewMode = "pdf" | "image" | "office" | "text" | "none";

// Comment ouvrir un fichier sans le télécharger : le navigateur sait afficher
// PDF et images ; les formats Office passent par la visionneuse en ligne de
// Microsoft (à la demande de la personne, voir la page d'un document).
export function previewModeFor(name: string): PreviewMode {
  const ext = extensionOf(name);
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (["docx", "pptx", "xlsx"].includes(ext)) return "office";
  if (["txt", "csv", "md"].includes(ext)) return "text";
  return "none";
}

export function fileKindLabel(name: string): string {
  const ext = extensionOf(name);
  const map: Record<string, string> = { pptx: "PowerPoint", docx: "Word", xlsx: "Excel", pdf: "PDF", csv: "CSV", txt: "Texte", md: "Texte", png: "Image", jpg: "Image", jpeg: "Image", webp: "Image" };
  return map[ext] ?? (ext ? ext.toUpperCase() : "Fichier");
}

// Nom de stockage sûr : pas d'accents ni d'espaces, jamais de « / » ni « .. ».
export function safeStorageName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[-.]+/, "")
    .slice(-90);
  return base || "document";
}
