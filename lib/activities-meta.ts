// Libellés partagés entre l'admin, le site public et les tests. Pas d'import de
// base de données ici : ce fichier est utilisable côté navigateur.
export const ACTIVITY_AXES = ["humanitaire", "guerison", "autonomisation"] as const;
export const ACTIVITY_STATUSES = ["en_cours", "en_projet", "terminee"] as const;
export type ActivityAxisValue = (typeof ACTIVITY_AXES)[number];
export type ActivityStatusValue = (typeof ACTIVITY_STATUSES)[number];

// Les trois axes de l'objet déclaré au ministère de l'Intérieur (dépôt du
// 3 août 2026) : on les reprend tels quels pour rester fidèle aux statuts.
export const AXIS_LABELS: Record<ActivityAxisValue, { title: string; statutory: string }> = {
  humanitaire: {
    title: "Actions humanitaires",
    statutory: "Un soutien concret aux personnes vulnérables : orphelins, veuves, enfants en difficulté.",
  },
  guerison: {
    title: "Guérison intérieure & bien-être mental",
    statutory:
      "L'accompagnement des femmes et des jeunes dans leur parcours de guérison intérieure et de bien-être mental.",
  },
  autonomisation: {
    title: "Autonomisation",
    statutory: "L'autonomisation des femmes et des jeunes.",
  },
};

export const STATUS_LABELS: Record<ActivityStatusValue, string> = {
  en_cours: "En cours",
  en_projet: "En projet",
  terminee: "Terminée",
};
