// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createLead, normalizeWhatsApp, validateLead } from "./leads";

const NAME = "ZZ Lead Test";

describe("normalizeWhatsApp", () => {
  it("adds +229 and the 01 prefix to an old 8-digit Benin number", () => {
    expect(normalizeWhatsApp("97 12 34 56")).toBe("+22901971234" + "56");
    expect(normalizeWhatsApp("0197123456")).toBe("+2290197123456");
    expect(normalizeWhatsApp("+33 6 12 34 56 78")).toBe("+33612345678");
  });

  it("rejects numbers that are clearly not phone numbers", () => {
    expect(normalizeWhatsApp("abc")).toBeNull();
    expect(normalizeWhatsApp("12")).toBeNull();
  });
});

describe("validateLead", () => {
  it("lowercases the email and collapses spaces in the name", () => {
    const r = validateLead({ fullName: "  Awa   Dossou ", channel: "email", contact: " Awa@Example.COM ", needsHelp: true });
    expect(r).toMatchObject({ ok: true, value: { fullName: "Awa Dossou", contact: "awa@example.com", needsHelp: true } });
  });

  it("rejects a missing name, a malformed email and an invalid number", () => {
    expect(validateLead({ fullName: " ", channel: "email", contact: "a@b.co" }).ok).toBe(false);
    expect(validateLead({ fullName: NAME, channel: "email", contact: "pas-un-email" }).ok).toBe(false);
    expect(validateLead({ fullName: NAME, channel: "whatsapp", contact: "abc" }).ok).toBe(false);
  });

  it("keeps only same-site paths as the source", () => {
    const ok = validateLead({ fullName: NAME, channel: "email", contact: "a@b.co", sourcePath: "https://evil.example/x" });
    expect(ok.ok && ok.value.sourcePath).toBeNull();
  });
});

describe("createLead", () => {
  afterEach(async () => {
    await db.lead.deleteMany({ where: { fullName: { startsWith: NAME } } });
  });

  it("stores the one channel the person chose, and nothing for the other", async () => {
    expect(await createLead({ fullName: NAME, channel: "whatsapp", contact: "0197000001", sourcePath: "/blog" })).toEqual({ status: "created" });

    const row = await db.lead.findFirstOrThrow({ where: { fullName: NAME } });
    expect(row).toMatchObject({ channel: "whatsapp", whatsapp: "+2290197000001", email: null, needsHelp: false, sourcePath: "/blog" });
  });

  it("does not duplicate the same email, and remembers a later request for help", async () => {
    await createLead({ fullName: NAME, channel: "email", contact: "zz.lead.test@example.com" });
    const again = await createLead({ fullName: `${NAME} bis`, channel: "email", contact: "ZZ.Lead.Test@example.com", needsHelp: true });

    expect(again).toEqual({ status: "existing" });
    const rows = await db.lead.findMany({ where: { email: "zz.lead.test@example.com" } });
    expect(rows).toHaveLength(1);
    expect(rows[0].needsHelp).toBe(true);
  });

  it("reports invalid input without writing anything", async () => {
    const r = await createLead({ fullName: NAME, channel: "email", contact: "nope" });
    expect(r.status).toBe("invalid");
    expect(await db.lead.count({ where: { fullName: NAME } })).toBe(0);
  });
});
