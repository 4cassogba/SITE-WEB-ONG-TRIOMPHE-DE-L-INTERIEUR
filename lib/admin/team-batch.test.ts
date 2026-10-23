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
  it("gives a scanner two easy words and three digits", () => {
    const pwd = generatePassword("scanner");
    expect(pwd).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
    expect(pwd.length).toBeGreaterThanOrEqual(8);
  });
  it("gives an admin a longer passphrase", () => {
    expect(generatePassword("admin")).toMatch(/^[a-z]+-[a-z]+-[a-z]+-\d{2}$/);
  });
  it("never repeats in a small batch", () => {
    const batch = new Set(Array.from({ length: 50 }, () => generatePassword()));
    expect(batch.size).toBe(50);
  });
});
