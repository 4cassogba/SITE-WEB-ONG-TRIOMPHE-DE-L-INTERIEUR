// Modèles de notes du dossier ressources, proposés dans l'onglet Documents du
// hub CIGIBM. Uniquement une structure à remplir : aucun chiffre ni fait inventé.

export type NoteTemplate = { key: string; label: string; title: (edition: number) => string; body: string };

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    key: "programme",
    label: "Programme détaillé",
    title: (n) => `CIGIBM ${n} : programme détaillé`,
    body: `# Programme

| Heure | Séquence | Intervenant·e | Durée |
|---|---|---|---|
| 09:00 | Accueil des participants | | |
| | | | |

# Intervenants et modérateurs

| Nom | Rôle | Sujet | Confirmé |
|---|---|---|---|
| | | | Non |

# Points d'attention

- Temps de parole
- Pause et circulation
- Moment de témoignages
`,
  },
  {
    key: "partenariat",
    label: "Dossier de partenariat",
    title: (n) => `CIGIBM ${n} : dossier de partenariat`,
    body: `# Ce que nous proposons

> Le rendez-vous annuel de la guérison intérieure et du bien-être mental, organisé par l'ONG Triomphe de l'Intérieur.

# Pourquoi nous soutenir

- (chiffres vérifiés uniquement, avec leur source)

# Contreparties

| Niveau | Apport | Contreparties |
|---|---|---|
| | | |

# Partenaires contactés

| Partenaire | Contact | Date | Statut | Accord écrit |
|---|---|---|---|---|
| | | | | Non |
`,
  },
  {
    key: "logistique",
    label: "Fiche logistique",
    title: (n) => `CIGIBM ${n} : fiche logistique`,
    body: `# Lieu

- Adresse :
- Contact sur place :
- Horaires d'accès :

# Équipe du jour

| Poste | Personne | Téléphone |
|---|---|---|
| Accueil et scan | | |
| Référent bien-être (personne en détresse) | | |
| Son et vidéo | | |

# Matériel

- [ ] Badges et listes
- [ ] Téléphones chargés pour le scan
- [ ] Signalétique
`,
  },
  {
    key: "reunion",
    label: "Compte rendu de réunion",
    title: (n) => `CIGIBM ${n} : réunion du `,
    body: `# Présents

-

# Décisions

1.

# Actions

| Action | Responsable | Échéance |
|---|---|---|
| | | |
`,
  },
  {
    key: "bilan",
    label: "Bilan de l'édition",
    title: (n) => `CIGIBM ${n} : bilan`,
    body: `# En chiffres (vérifiés)

| Indicateur | Valeur | Source |
|---|---|---|
| Inscrits | | Admin, onglet Public |
| Présents jour 1 | | Scan |
| Présents jour 2 | | Scan |
| Via les ambassadeurs | | Admin |

# Ce qui a bien marché

-

# À améliorer

-

# Témoignages (avec accord)

>

# Suites proposées aux participants

- Atelier, communauté GTI, accompagnement
`,
  },
];

export function findTemplate(key: string | undefined) {
  return NOTE_TEMPLATES.find((t) => t.key === key);
}
