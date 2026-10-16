import { describe, expect, it } from "vitest";
import { generatePassword, generateScannerEmail, parseTeamLines } from "./team-batch";

describe("parseTeamLines", () => {
  it("accepts a name alone or a name with an email, ignoring blank lines", () => {
    expect(parseTeamLines("Awa Dossou\n\n Fatou Diallo , fatou@example.com \r\n")).toEqual([
      { fullName: "Awa Dossou", email: undefined },
      { fullName: "Fatou Diallo", email: "fatou@example.com" },
    ]);
  });
});

describe("generateScannerEmail", () => {
  it("strips accents and spaces and adds a numeric suffix", () => {
    expect(generateScannerEmail("Éloïse Zodékon", "example.com")).toMatch(/^eloise\.zodekon\.\d{3}@example\.com$/);
  });
});

describe("generatePassword", () => {
  it("is short enough to say aloud and long enough for Supabase", () => {
    const pwd = generatePassword();
    expect(pwd).toMatch(/^scan\d{5}$/);
    expect(pwd.length).toBeGreaterThanOrEqual(6);
  });
});
