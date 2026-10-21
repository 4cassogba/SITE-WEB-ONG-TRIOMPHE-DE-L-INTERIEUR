import { describe, expect, it } from "vitest";
import { frenchSpacing } from "./typography";

describe("frenchSpacing", () => {
  it("attache guillemets et ponctuation haute au mot voisin", () => {
    expect(frenchSpacing("« La résilience » : une une ?")).toBe("«\u00a0La résilience\u00a0»\u00a0: une une\u00a0?");
  });
  it("ne touche pas au reste du texte", () => {
    expect(frenchSpacing("Bonjour, le CIGIBM 2026.")).toBe("Bonjour, le CIGIBM 2026.");
  });
});
