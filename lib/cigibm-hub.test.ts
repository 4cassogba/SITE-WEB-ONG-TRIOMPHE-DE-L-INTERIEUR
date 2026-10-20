import { describe, expect, it } from "vitest";
import {
  buildChecklist,
  buildInsights,
  bucketByDay,
  daysUntil,
  editionPhase,
  nextStatus,
  parseDateInput,
  phaseLabel,
  toDateInput,
  validateEditionForm,
  validateTaskForm,
  CHECKLIST_TEMPLATE,
  TASK_CATEGORIES,
  type InsightInput,
} from "./cigibm-hub";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("dates à l'heure de Cotonou", () => {
  it("compte les jours calendaires locaux, pas les 24 h écoulées", () => {
    // 23h30 UTC le 16 = 00h30 le 17 à Cotonou
    const now = new Date("2026-10-16T23:30:00Z");
    expect(daysUntil(new Date("2026-10-17T12:00:00Z"), now)).toBe(0);
    expect(daysUntil(new Date("2026-10-18T12:00:00Z"), now)).toBe(1);
  });
  it("aller-retour d'une date de formulaire", () => {
    expect(toDateInput(parseDateInput("2027-03-05"))).toBe("2027-03-05");
    expect(parseDateInput("5/3/2027")).toBeNull();
    expect(parseDateInput("2027-13-45")).toBeNull();
  });
  it("décrit la phase d'une édition", () => {
    const now = new Date("2026-10-20T10:00:00Z");
    expect(phaseLabel(editionPhase(null, now))).toBe("Date à définir");
    expect(phaseLabel(editionPhase(new Date("2026-10-17T12:00:00Z"), now))).toBe("Terminée il y a 3 jours");
    expect(phaseLabel(editionPhase(new Date("2026-10-21T12:00:00Z"), now))).toBe("Demain");
    expect(phaseLabel(editionPhase(new Date("2026-11-20T12:00:00Z"), now))).toBe("J-31");
  });
});

describe("checklist type", () => {
  it("couvre chaque catégorie et date les tâches relativement au jour J", () => {
    const list = buildChecklist(new Date("2027-06-12T12:00:00Z"));
    expect(list).toHaveLength(CHECKLIST_TEMPLATE.length);
    for (const c of TASK_CATEGORIES) expect(list.some((t) => t.category === c)).toBe(true);
    const salle = list.find((t) => t.title.startsWith("Réserver"))!;
    expect(toDateInput(salle.dueDate)).toBe("2027-01-13"); // J-150
  });
  it("sans date d'édition, aucune échéance inventée", () => {
    expect(buildChecklist(null).every((t) => t.dueDate === null)).toBe(true);
  });
  it("le statut tourne todo, doing, done, todo", () => {
    expect(nextStatus("todo")).toBe("doing");
    expect(nextStatus("doing")).toBe("done");
    expect(nextStatus("done")).toBe("todo");
  });
});

const base: InsightInput = {
  editionNumber: 4, eventDate: new Date("2026-10-17T12:00:00Z"), now: new Date("2026-10-20T10:00:00Z"),
  participants: 300, attended: 250, noShows: 50, noShowsWithEmail: 40, ambassadorsActive: 20, ambassadorsWithoutReferral: 5,
  tasksTotal: 0, tasksDone: 0, tasksOverdue: 0, leadsToContact: 0, leadsNeedingHelp: 0,
};

describe("alertes", () => {
  it("après l'édition : propose de relancer les absents", () => {
    const out = buildInsights(base);
    const a = out.find((x) => x.title.includes("non présent"))!;
    expect(a.level).toBe("alert");
    expect(a.detail).toContain("40 ont un email");
  });
  it("avant l'édition : pas de relance des absents, mais les ambassadeurs sans inscrit", () => {
    const out = buildInsights({ ...base, eventDate: new Date("2026-12-01T12:00:00Z"), noShows: 300, attended: 0 });
    expect(out.some((x) => x.title.includes("non présent"))).toBe(false);
    expect(out.some((x) => x.title.includes("ambassadeur"))).toBe(true);
  });
  it("sans date : demande de la définir", () => {
    expect(buildInsights({ ...base, eventDate: null }).some((x) => x.title.includes("Date"))).toBe(true);
  });
  it("retards de checklist et contacts qui demandent de l'aide sont des alertes", () => {
    const out = buildInsights({ ...base, tasksTotal: 10, tasksOverdue: 2, leadsToContact: 3, leadsNeedingHelp: 1 });
    expect(out.find((x) => x.title.startsWith("2 tâches"))?.level).toBe("alert");
    expect(out.find((x) => x.title.includes("contacts à rappeler"))?.level).toBe("alert");
  });
  it("rien à signaler : un message positif", () => {
    const out = buildInsights({ ...base, noShows: 0, noShowsWithEmail: 0, ambassadorsWithoutReferral: 0, tasksTotal: 10, tasksDone: 6 });
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe("good");
  });
  it("pas de checklist proposée pour une édition ancienne", () => {
    const out = buildInsights({ ...base, eventDate: new Date("2024-04-27T12:00:00Z") });
    expect(out.some((x) => x.title.includes("checklist"))).toBe(false);
  });
});

describe("inscriptions par jour", () => {
  it("remplit les jours sans inscription", () => {
    const out = bucketByDay([new Date("2026-10-01T10:00:00Z"), new Date("2026-10-01T11:00:00Z"), new Date("2026-10-04T10:00:00Z")]);
    expect(out.map((d) => d.count)).toEqual([2, 0, 0, 1]);
  });
  it("liste vide", () => expect(bucketByDay([])).toEqual([]));
});

describe("formulaires", () => {
  it("tâche : refuse un titre court, une catégorie inconnue, une date invalide", () => {
    expect(validateTaskForm(form({ title: "ab", category: "programme" })).ok).toBe(false);
    expect(validateTaskForm(form({ title: "Titre ok", category: "x" })).ok).toBe(false);
    expect(validateTaskForm(form({ title: "Titre ok", category: "programme", dueDate: "demain" })).ok).toBe(false);
    const ok = validateTaskForm(form({ title: " Titre ok ", category: "finances", dueDate: "2027-01-02", owner: " Christelle " }));
    expect(ok.ok && ok.value.owner).toBe("Christelle");
  });
  it("édition : numéro, thème, dates, lieu obligatoires", () => {
    const good = { number: "5", theme: "Tenir debout ensemble", dates: "12 juin 2027", venue: "Palais des Congrès", eventDate: "2027-06-12" };
    expect(validateEditionForm(form(good)).ok).toBe(true);
    expect(validateEditionForm(form({ ...good, number: "0" })).ok).toBe(false);
    expect(validateEditionForm(form({ ...good, theme: "" })).ok).toBe(false);
    expect(validateEditionForm(form({ ...good, eventDate: "12/06/2027" })).ok).toBe(false);
    expect(validateEditionForm(form({ ...good, eventDate: "" })).ok).toBe(true);
  });
});
