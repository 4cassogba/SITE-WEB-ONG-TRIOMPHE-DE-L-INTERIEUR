// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createActivity, listPublishedActivities, setActivityPublished, validateActivityForm } from "./activities";

const PREFIX = "ZZ Activité Test";

function form(over: Record<string, string> = {}) {
  const f = new FormData();
  const base: Record<string, string> = {
    title: `${PREFIX} Alpha`,
    summary: "Un résumé suffisamment long pour être valide.",
    axis: "guerison",
    status: "en_projet",
    sortOrder: "3",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) f.set(k, v);
  return f;
}

describe("validateActivityForm", () => {
  it("accepts a complete form and keeps the optional fields null when empty", () => {
    const r = validateActivityForm(form({ description: "  ", href: "/cigibm", published: "on" }));
    expect(r).toMatchObject({
      ok: true,
      value: { title: `${PREFIX} Alpha`, description: null, href: "/cigibm", published: true, sortOrder: 3 },
    });
  });

  it("rejects a short title, a short summary, an unknown axis and an unknown status", () => {
    expect(validateActivityForm(form({ title: "ab" })).ok).toBe(false);
    expect(validateActivityForm(form({ summary: "court" })).ok).toBe(false);
    expect(validateActivityForm(form({ axis: "autre" })).ok).toBe(false);
    expect(validateActivityForm(form({ status: "inconnu" })).ok).toBe(false);
  });

  it("only allows site paths or https links, never javascript: or protocol-relative URLs", () => {
    expect(validateActivityForm(form({ href: "javascript:alert(1)" })).ok).toBe(false);
    expect(validateActivityForm(form({ href: "//evil.example" })).ok).toBe(false);
    expect(validateActivityForm(form({ href: "http://insecure.example" })).ok).toBe(false);
    expect(validateActivityForm(form({ href: "https://ok.example/page" })).ok).toBe(true);
  });
});

describe("activities in the database", () => {
  afterEach(async () => {
    await db.activity.deleteMany({ where: { title: { startsWith: PREFIX } } });
  });

  const input = (title: string, over = {}) => {
    const r = validateActivityForm(form({ title }));
    if (!r.ok) throw new Error(r.error);
    return { ...r.value, ...over };
  };

  it("gives two activities with the same title different slugs", async () => {
    const a = await createActivity(input(`${PREFIX} Doublon`));
    const b = await createActivity(input(`${PREFIX} Doublon`));
    expect(a.slug).not.toBe(b.slug);
  });

  it("shows only published activities to the public, never the internal note", async () => {
    const draft = await createActivity(input(`${PREFIX} Brouillon`, { internalNote: "secret interne" }));
    const live = await createActivity(input(`${PREFIX} Publiée`, { published: true, internalNote: "secret interne" }));

    let titles = (await listPublishedActivities()).map((a) => a.title);
    expect(titles).toContain(live.title);
    expect(titles).not.toContain(draft.title);
    expect(JSON.stringify(await listPublishedActivities())).not.toContain("secret interne");

    await setActivityPublished(draft.id, true);
    titles = (await listPublishedActivities()).map((a) => a.title);
    expect(titles).toContain(draft.title);
  });
});
