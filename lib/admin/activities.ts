import { db } from "@/lib/db";
import { slugify } from "@/lib/ambassadors/slug";
import {
  ACTIVITY_AXES,
  ACTIVITY_STATUSES,
  type ActivityAxisValue,
  type ActivityStatusValue,
} from "@/lib/activities-meta";

export type ActivityInput = {
  title: string;
  summary: string;
  description: string | null;
  axis: ActivityAxisValue;
  audience: string | null;
  status: ActivityStatusValue;
  published: boolean;
  sortOrder: number;
  href: string | null;
  internalNote: string | null;
};

export type ActivityValidation = { ok: true; value: ActivityInput } | { ok: false; error: string };

const clean = (v: FormDataEntryValue | null | undefined) => {
  const s = v?.toString().trim();
  return s ? s : null;
};

// Valide ce que saisit l'admin. `href` n'accepte qu'un chemin du site ("/…")
// ou une adresse https : jamais « javascript: » ni autre schéma.
export function validateActivityForm(form: FormData): ActivityValidation {
  const title = clean(form.get("title"));
  const summary = clean(form.get("summary"));
  const axis = form.get("axis")?.toString();
  const status = form.get("status")?.toString();
  const href = clean(form.get("href"));

  if (!title || title.length < 3 || title.length > 120) return { ok: false, error: "Le titre est obligatoire (3 à 120 caractères)." };
  if (!summary || summary.length < 10 || summary.length > 280) return { ok: false, error: "Le résumé est obligatoire (10 à 280 caractères)." };
  if (!ACTIVITY_AXES.includes(axis as ActivityAxisValue)) return { ok: false, error: "Choisissez un axe." };
  if (!ACTIVITY_STATUSES.includes(status as ActivityStatusValue)) return { ok: false, error: "Choisissez un statut." };
  if (href && !(href.startsWith("/") && !href.startsWith("//")) && !/^https:\/\/\S+$/.test(href)) {
    return { ok: false, error: "Le lien doit commencer par « / » (page du site) ou « https:// »." };
  }

  const order = Number.parseInt(form.get("sortOrder")?.toString() ?? "0", 10);
  return {
    ok: true,
    value: {
      title,
      summary,
      description: clean(form.get("description")),
      axis: axis as ActivityAxisValue,
      audience: clean(form.get("audience")),
      status: status as ActivityStatusValue,
      published: form.get("published") === "on",
      sortOrder: Number.isFinite(order) ? order : 0,
      href,
      internalNote: clean(form.get("internalNote")),
    },
  };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "activite";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await db.activity.findUnique({ where: { slug: candidate } }))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export const listActivities = () =>
  db.activity.findMany({ orderBy: [{ axis: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }] });

export const getActivity = (id: string) => db.activity.findUnique({ where: { id } });

export async function createActivity(input: ActivityInput) {
  return db.activity.create({ data: { ...input, slug: await uniqueSlug(input.title) } });
}

// Le slug ne change pas à la modification : il peut déjà servir dans un lien.
export const updateActivity = (id: string, input: ActivityInput) => db.activity.update({ where: { id }, data: input });

export const setActivityPublished = (id: string, published: boolean) =>
  db.activity.update({ where: { id }, data: { published } });

export const deleteActivity = (id: string) => db.activity.delete({ where: { id } });

// Côté public : seulement le publié, jamais la note interne.
export async function listPublishedActivities() {
  return db.activity.findMany({
    where: { published: true },
    orderBy: [{ axis: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      axis: true,
      audience: true,
      status: true,
      href: true,
    },
  });
}
