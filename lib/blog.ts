// Contenu du Blog & Activités. Chaque post a un type ("article" ou
// "activite") pour permettre de filtrer les deux dans une seule grille.
// Le corps (`body`) est une liste de blocs typés plutôt qu'un texte brut,
// pour pouvoir alterner paragraphes, listes, citations et sections
// image-à-côté-du-texte quand un article est long.

// Dans les textes (paragraphes, listes, imageText), `[libellé](/chemin)` ou
// `[libellé](https://…)` devient un lien : interne si le chemin commence par
// « / », externe (nouvel onglet) sinon.
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  // `cite` : auteur et source d'une citation réelle. Sans `cite`, la citation
  // est une phrase de l'ONG elle-même.
  | { type: "quote"; text: string; cite?: string }
  | {
      type: "imageText";
      image: { src: string; alt: string };
      imagePosition: "left" | "right";
      // "portrait" pour une une de journal ou un portrait, sinon paysage 4/3.
      imageAspect?: "landscape" | "portrait";
      caption?: string;
      heading?: string;
      paragraphs: string[];
    }
  | { type: "references"; heading?: string; items: { label: string; href?: string }[] }
  | {
      type: "links";
      heading?: string;
      items: { label: string; href: string }[];
    }
  | { type: "video"; youtubeId: string; title: string; caption?: string }
  // Faits clés en cartes (« En bref ») : uniquement des faits vérifiés.
  | { type: "facts"; heading?: string; items: { value: string; label: string }[] };

export type BlogPost = {
  slug: string;
  type: "article" | "activite";
  title: string;
  excerpt: string;
  date: string; // format affiché
  isoDate: string; // format ISO pour les métadonnées / JSON-LD
  readTime: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  // position "top" : garde le haut de l'image quand le bandeau la recadre
  // (photo de groupe dont les visages sont en haut). Centre par défaut.
  featuredImage: { src: string; alt: string; credit?: string; position?: "top" | "center" };
  body: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "les-nouvelles-du-jour-cigibm-2026-resilience-face-a-la-depression",
    type: "article",
    title: "« La résilience face à la dépression » : Les Nouvelles du jour met le CIGIBM 2026 à sa une",
    excerpt:
      "Dans sa parution n°1569 du mercredi 21 octobre 2026, le quotidien Les Nouvelles du jour consacre sa une et sa page 6 à la 4ème édition du CIGIBM. Ce qu'en retient le journaliste Jocelyn Afaou, ce qu'a dit la marraine Ella Wama, et pourquoi cet écho compte.",
    date: "21 octobre 2026",
    isoDate: "2026-10-21",
    readTime: "5 min",
    author: "ONG Triomphe de l'Intérieur",
    authorRole: "Équipe de communication",
    authorAvatar: "/images/logo-mark.png",
    featuredImage: {
      src: "/images/cigibm/reportage-nouvelles-du-jour-cover.jpg",
      alt: "La une et la page 6 des Nouvelles du jour du mercredi 21 octobre 2026 : « La Coach Christelle Eugénie Gnimassou opte pour la résilience face à la dépression »",
    },
    body: [
      {
        type: "paragraph",
        text: "Deux jours, deux quotidiens. Après [Fraternité](/blog/fraternite-reportage-cigibm-2026-guerison-interieure) mardi, c'est au tour des [Nouvelles du jour](https://www.facebook.com/profile.php?id=100083789449151) de revenir sur le CIGIBM 2026. Dans sa parution n°1569 de ce mercredi 21 octobre 2026, ce quotidien indépendant d'informations, d'analyses et de publicités, dans sa 16ème année, annonce le sujet dès sa une, avant de lui consacrer la page 6, rubrique Actualité, sous la plume de Jocelyn Afaou.",
      },
      {
        type: "facts",
        heading: "En bref",
        items: [
          { value: "N° 1569", label: "Les Nouvelles du jour, mercredi 21 octobre 2026" },
          { value: "Une + p. 6", label: "Annoncé en une, développé en page Actualité" },
          { value: "17-18 oct.", label: "Deux journées au Palais des Congrès de Cotonou" },
          { value: "4ème édition", label: "Thème : « Le vaccin de la dépression »" },
        ],
      },
      {
        type: "heading",
        text: "En une, parmi les sujets qui font l'actualité du pays",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/nouvelles-du-jour-une-21-octobre-2026.jpg",
          alt: "Une des Nouvelles du jour, parution n°1569 du mercredi 21 octobre 2026, avec l'encadré « Guérison intérieure et bien-être mental » consacré à Coach Christelle Eugénie Gnimassou",
        },
        imagePosition: "left",
        imageAspect: "portrait",
        caption: "Les Nouvelles du jour, parution n°1569, mercredi 21 octobre 2026, une.",
        paragraphs: [
          "Le CIGIBM partage la une avec des sujets d'envergure nationale : l'examen du budget 2027 à l'Assemblée nationale, la modernisation de l'accès à la fonction publique, les prochaines assises de la presse béninoise. Dans son encadré « Guérison intérieure et bien-être mental », le journal titre : « La Coach Christelle Eugénie Gnimassou opte pour la résilience face à la dépression ».",
          "Cette place a un sens. La santé mentale n'est pas un sujet à part, à glisser en fin de journal : elle touche l'école, le travail, la famille, et donc la vie de tout le pays.",
        ],
      },
      {
        type: "heading",
        text: "Ce que retient le reportage",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/nouvelles-du-jour-page-6-21-octobre-2026.jpg",
          alt: "Page 6 des Nouvelles du jour du 21 octobre 2026, rubrique Actualité : « La Coach Christelle Eugénie Gnimassou opte pour la résilience face à la dépression », avec la photo de famille du congrès sur scène",
        },
        imagePosition: "right",
        imageAspect: "portrait",
        caption: "Les Nouvelles du jour, n°1569, page 6, rubrique Actualité. Article de Jocelyn Afaou.",
        paragraphs: [
          "Le journaliste pose le cadre : le Palais des Congrès de Cotonou, les 17 et 18 octobre 2026, pour la 4ème édition du Congrès International de Guérison Intérieure et de Bien-être Mental, autour du thème « Le vaccin de la dépression ». Une édition portée par l'ONG Triomphe de l'Intérieur et parrainée par [Ella Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/), experte en genre.",
          "Selon le quotidien, l'ambition est double : mettre fin aux difficultés liées à la santé mentale, et encourager une meilleure prise en compte des souffrances psychologiques.",
        ],
      },
      {
        type: "heading",
        text: "Une souffrance qu'on n'ose pas dire",
      },
      {
        type: "paragraph",
        text: "Le reportage pose un constat que nous entendons souvent sur le terrain : les blessures psychologiques sont difficiles à exprimer, dans des sociétés où la souffrance intérieure est parfois assimilée à un manque de foi. C'est pour cette raison, écrit le journal, que l'ONG Triomphe de l'Intérieur a organisé cette 4ème édition.",
      },
      {
        type: "paragraph",
        text: "Nous le disons simplement : croire et prendre soin de soi ne s'opposent pas. Demander de l'aide n'est ni une faiblesse ni un manque de foi. C'est un acte de lucidité.",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/coach-christelle-cigibm-2026-echarpe.jpg",
          alt: "Coach Christelle Gnimassou, promotrice du CIGIBM, en tenue verte avec diadème et écharpe, devant les panneaux du congrès",
        },
        imagePosition: "left",
        heading: "Le « vaccin », une métaphore",
        caption: "Coach Christelle Gnimassou, promotrice du CIGIBM, lors de la 4ème édition.",
        paragraphs: [
          "Le journal revient sur le sens du thème, tel que l'explique la promotrice, Coach Christelle Eugénie Gnimassou : le « vaccin » ne désigne pas un produit pharmaceutique. C'est une métaphore des ressources que chacun peut mobiliser pour tenir, avant que la souffrance ne s'installe.",
          "Autrement dit : on n'attend pas la crise. On apprend à la voir venir, à en parler et à s'entourer. C'est le cœur de la [Méthode R.A.C.I.N.E.S.](/methode-racines).",
        ],
      },
      {
        type: "quote",
        text: "L'objectif principal de la cérémonie est d'encourager les personnes en difficulté à parler de leur situation avant que cela ne s'aggrave.",
        cite: "Les Nouvelles du jour, 21 octobre 2026, page 6",
      },
      {
        type: "heading",
        text: "La parole de la marraine",
      },
      {
        type: "paragraph",
        text: "Le quotidien rapporte aussi l'intervention d'[Ella Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/). Après avoir salué l'engagement de la promotrice et sa détermination à aborder les sujets liés à la dépression, la marraine a rappelé une évidence trop souvent oubliée :",
      },
      {
        type: "quote",
        text: "La santé mentale constitue une composante essentielle de la dignité humaine et de l'épanouissement individuel et collectif.",
        cite: "Propos d'[Ella Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/), marraine du CIGIBM 2026, rapportés par Les Nouvelles du jour",
      },
      {
        type: "paragraph",
        text: "Elle a ensuite nommé celles et ceux que la souffrance psychologique touche de plein fouet :",
      },
      {
        type: "list",
        items: [
          "Les jeunes, soumis aux pressions scolaires, universitaires ou professionnelles.",
          "Les femmes qui portent les conséquences de violences ou de traumatismes familiaux.",
        ],
      },
      {
        type: "paragraph",
        text: "Pour finir, elle a plaidé pour une mobilisation de tous : les familles, les établissements scolaires et universitaires, les milieux populaires et les structures de santé.",
      },
      {
        type: "heading",
        text: "Ce que cet écho nous engage à faire",
      },
      {
        type: "paragraph",
        text: "Les femmes et les jeunes : ce sont précisément les personnes que notre ONG s'est donné pour mission d'accompagner, vers le bien-être mental et l'autonomie. Le plaidoyer de la marraine rejoint notre conviction : personne ne peut porter seul la santé mentale. Le CIGIBM est un rendez-vous ; le travail, lui, continue toute l'année, avec les familles, les écoles et les universités, les quartiers, et en orientant vers les professionnels de santé quand c'est nécessaire.",
      },
      {
        type: "paragraph",
        text: "Si vous vous reconnaissez dans ce que décrit l'article, ou si un proche traverse une période difficile, n'attendez pas que cela s'aggrave : [écrivez-nous](/contact), sans jugement. Établissements, associations, institutions : nous sommes disponibles pour construire ensemble.",
      },
      {
        type: "heading",
        text: "Merci aux Nouvelles du jour",
      },
      {
        type: "paragraph",
        text: "Merci à la rédaction des [Nouvelles du jour](https://www.facebook.com/profile.php?id=100083789449151) et à Jocelyn Afaou d'avoir donné à la santé mentale une place en une. Pour retrouver toute la couverture du CIGIBM 2026 : le [reportage de Fraternité](/blog/fraternite-reportage-cigibm-2026-guerison-interieure), la [revue de presse](/blog/revue-de-presse-cigibm-2026-la-droiture-l-emergent), le [coup d'envoi au Palais des Congrès](/blog/cigibm-2026-coup-d-envoi-palais-des-congres) et la [conférence de presse du 10 octobre](/blog/conference-presse-cigibm-vaccin-de-la-depression).",
      },
    ],
  },
  {
    slug: "fraternite-reportage-cigibm-2026-guerison-interieure",
    type: "article",
    title: "Fraternité raconte le CIGIBM 2026 : « un rendez-vous de guérison intérieure »",
    excerpt:
      "Dans son édition du 20 octobre 2026, le quotidien Fraternité consacre sa une et sa page 10 au CIGIBM. Retour sur un reportage qui explique ce que veut vraiment dire « le vaccin de la dépression », et sur l'appel qu'il nous invite à adresser aux pouvoirs publics.",
    date: "20 octobre 2026",
    isoDate: "2026-10-20",
    readTime: "6 min",
    author: "ONG Triomphe de l'Intérieur",
    authorRole: "Équipe de communication",
    authorAvatar: "/images/logo-mark.png",
    featuredImage: {
      src: "/images/cigibm/reportage-fraternite-cover.jpg",
      alt: "La une de Fraternité du mardi 20 octobre 2026 et la page 10 consacrée au CIGIBM : « Christelle Gnimassou fait du CIGIBM un rendez-vous de guérison intérieure »",
    },
    body: [
      {
        type: "paragraph",
        text: "Il y a des lendemains de congrès qui se mesurent à ce que la presse en retient. Ce mardi 20 octobre 2026, [Fraternité](https://fraternite.bj/), quotidien béninois d'information et d'analyse, a placé le CIGIBM à sa une, rubrique « Culture et Société », avec un reportage complet en page 10. Quelques jours plus tôt, le même journal avait déjà couvert [la conférence de presse qui annonçait l'édition](https://fraternite.bj/4e-edition-du-congres-international-de-guerison-interieure-et-de-bien-etre-mental-mettre-le-vaccin-de-la-depression-au-coeur-des-priorites/). Avant, puis après : un fil rouge que nous tenons à saluer.",
      },
      {
        type: "heading",
        text: "À la une : un congrès, une métaphore",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/Fraternité 1.jpeg",
          alt: "Une de Fraternité, n° 6727 du mardi 20 octobre 2026, avec l'encadré consacré au CIGIBM",
        },
        imagePosition: "left",
        imageAspect: "portrait",
        caption: "Fraternité, n° 6727, mardi 20 octobre 2026, une.",
        paragraphs: [
          "Sous la rubrique « Culture et Société », la une annonce un article de la page 10 : « Christelle Gnimassou fait du CIGIBM un rendez-vous de guérison intérieure ». Le titre dit l'essentiel : en quatre éditions, le congrès est devenu un rendez-vous, un moment que l'on attend et que l'on retrouve.",
          "À côté des grands sujets du jour, la santé mentale prend sa place en première page. C'est précisément ce que cherche le CIGIBM : sortir le sujet de la marge.",
        ],
      },
      {
        type: "heading",
        text: "Avant le congrès : ce que Fraternité avait déjà expliqué",
      },
      {
        type: "paragraph",
        text: "Dans son article du 12 octobre, signé Fidégnon, Fraternité rapporte l'annonce faite lors de [la conférence de presse du 10 octobre](/blog/conference-presse-cigibm-vaccin-de-la-depression), à l'auditorium de la Fondation Friedrich Ebert, le jour de la Journée mondiale de la santé mentale. Le journal s'arrête longuement sur le thème, « Le vaccin de la dépression », et sur la manière dont Coach Christelle Gnimassou le définit.",
      },
      {
        type: "quote",
        text: "Le « vaccin » ne renvoie pas à un produit pharmaceutique ou à une guérison miracle, mais à des moyens concrets et accessibles à tous pour renforcer sa résilience avant l'effondrement.",
        cite: "Coach Christelle Gnimassou, citée par Fraternité, 12 octobre 2026",
      },
      {
        type: "paragraph",
        text: "Le journal relève aussi les chiffres qui justifient cette logique de prévention. Nous les reprenons tels que Fraternité les cite, d'après l'Organisation mondiale de la Santé :",
      },
      {
        type: "list",
        items: [
          "Plus d'un milliard de personnes vivent aujourd'hui avec un trouble de santé mentale.",
          "Entre 1990 et 2013, le nombre de personnes touchées par la dépression ou l'anxiété est passé de 416 à 615 millions, soit une hausse de près de 50 %.",
          "Le coût économique mondial de ces troubles est estimé à environ 1 000 milliards de dollars par an, surtout en perte de productivité.",
          "Chaque dollar investi dans le traitement de la dépression et de l'anxiété rapporterait environ 4 dollars en santé et en productivité.",
        ],
      },
      {
        type: "paragraph",
        text: "Fraternité souligne aussi un choix de positionnement : le CIGIBM ne se présente ni comme un hôpital ni comme un ministère, mais comme une plateforme de prévention ancrée dans les communautés, et multisectorielle, car la santé mentale touche l'éducation, la protection sociale, l'emploi et l'entrepreneuriat. Pour cette édition, le journal rappelait l'ambition affichée : plus de 3 000 participants en présentiel et 100 000 en ligne, dans une vingtaine de pays.",
      },
      {
        type: "heading",
        text: "Le jour J vu par Fraternité",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/cigibm-equipe-souriante.jpg",
          alt: "L'équipe du CIGIBM en tenue blanche et vert, souriante, autour de Christelle Gnimassou en tenue verte, devant le panneau du congrès",
        },
        imagePosition: "right",
        caption: "L'équipe du CIGIBM autour de sa promotrice (photo : Jean Karl).",
        paragraphs: [
          "C'est dans la Salle Rouge du Palais des Congrès de Cotonou que s'est ouverte, le 17 octobre, la 4ème édition. Fraternité rappelle que l'événement est organisé par l'ONG Triomphe de l'Intérieur à l'initiative de sa promotrice, avec le soutien de l'ONG [Filles en Action](https://www.fillesenactions.org/), de Ghana Access et d'autres partenaires.",
          "Le ton de la journée a été donné dès la cérémonie d'ouverture par la marraine, [Ella Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/), experte en genre. Le reportage en détaille ensuite les temps forts.",
        ],
      },
      {
        type: "list",
        items: [
          "[Annick Mireille Azandjèmè](https://www.linkedin.com/in/annick-azandjeme-5b705148/) a invité l'assistance à regarder la dépression au-delà de l'individu : deuils non résolus, traumatismes enfouis et schémas familiaux inconscients peuvent se transmettre d'une génération à l'autre.",
          "Jessie Vanessa a exploré le lien entre vie spirituelle et blessures affectives, en insistant sur la nécessité de guérir son intériorité, sans que la foi serve de prétexte pour négliger le suivi émotionnel.",
          "[Valdye Gbaguidi](https://www.linkedin.com/in/valdye-gbaguidi-921a9b2a3/) a abordé la confiance en soi, le regard de l'entourage et la stigmatisation : aucune personne ne saurait être réduite à ses difficultés ni enfermée dans une étiquette. Demander de l'aide est encore trop souvent perçu comme une faiblesse.",
          "Espoir Tchehoun a consacré son intervention à la prévention du burn-out : effets du surmenage et de la pression constante, besoin d'un meilleur équilibre entre exigences professionnelles et santé mentale.",
          "Le grand panel, avec Rudy Chapsal Aboua et Astéris A. Ahouignan, s'est penché sur les piliers de la résilience : la famille, la foi, le travail et la gestion des finances.",
          "En fin de journée, Christelle Eugénie Gnimassou a présenté en détail la vision du « Vaccin de la Dépression », avant de remettre des distinctions aux ambassadeurs et challengers engagés dans la cause.",
        ],
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/cigibm-photo-ensemble-scene.jpg",
          alt: "Photo de famille des participants du CIGIBM 2026, rassemblés debout sur la scène devant les fauteuils rouges de la salle",
        },
        imagePosition: "left",
        heading: "Une salle, une même cause",
        caption: "Photo de famille du CIGIBM 2026 (photo : Jean Karl).",
        paragraphs: [
          "À la fin de la journée, participants, intervenants et équipe se sont retrouvés sur scène pour la photo de famille. Une image qui dit mieux que des mots ce que le congrès voulait montrer : un sujet qu'on ne porte plus seul.",
        ],
      },
      {
        type: "quote",
        text: "Le « vaccin » contre la dépression n'est pas une réponse unique, mais une approche globale du bien-être, où chaque dimension de l'existence compte et où l'équilibre de l'une soutient celui des autres.",
        cite: "Fraternité, 20 octobre 2026, page 10",
      },
      {
        type: "heading",
        text: "Un appel aux pouvoirs publics",
      },
      {
        type: "paragraph",
        text: "Le reportage se termine sur une phrase que nous faisons nôtre : la santé mentale est un droit fondamental, non un luxe. Un droit ne se garantit pas par la seule bonne volonté d'une ONG. C'est pourquoi nous nous permettons, avec respect et dans un esprit de collaboration, d'adresser trois demandes à la [Présidence de la République](https://presidence.bj), au [ministère de la Santé](https://sante.gouv.bj) et, plus largement, au [Gouvernement](https://www.gouv.bj) :",
      },
      {
        type: "list",
        items: [
          "Inscrire la prévention en santé mentale parmi les priorités de santé publique, aux côtés de la vaccination et du dépistage, puisque agir en amont coûte moins cher, humainement et économiquement, qu'agir dans l'urgence.",
          "Associer les initiatives communautaires comme le CIGIBM aux campagnes nationales, à commencer par la Journée mondiale de la santé mentale du 10 octobre, pour que leur travail de sensibilisation rejoigne celui des institutions.",
          "Faciliter l'accès à l'écoute et à l'accompagnement psychologique de proximité, au plus près des communautés. La caravane de sensibilisation prévue pour cette édition, de la Place de l'Amazone à la Cité Ministérielle, en portait symboliquement l'idée : le message doit circuler jusqu'aux lieux de décision.",
        ],
      },
      {
        type: "paragraph",
        text: "Le CIGIBM ne remplace ni l'hôpital ni le ministère : il en est un relais, en amont, là où la souffrance n'a pas encore de nom. Notre porte est ouverte à toute institution qui souhaite échanger, construire ou simplement mieux comprendre ce que nous faisons sur le terrain : [écrivez-nous](/contact).",
      },
      {
        type: "heading",
        text: "Merci à Fraternité",
      },
      {
        type: "paragraph",
        text: "Une édition se joue dans la salle, mais elle se prolonge dans les journaux. Merci au groupe de presse [Fraternité](https://fraternite.bj/), à Marina Hounnou et à Fidégnon, d'avoir donné de l'espace à un sujet que l'on traite encore trop rarement. Pour retrouver nos autres articles, parcourez la [revue de presse du CIGIBM 2026](/blog/revue-de-presse-cigibm-2026-la-droiture-l-emergent), le [coup d'envoi au Palais des Congrès](/blog/cigibm-2026-coup-d-envoi-palais-des-congres) et notre page sur la [Méthode R.A.C.I.N.E.S.](/methode-racines).",
      },
    ],
  },
  {
    slug: "revue-de-presse-cigibm-2026-la-droiture-l-emergent",
    type: "article",
    title: "Revue de presse : le CIGIBM 2026 à la une de La Droiture et de L'Émergent",
    excerpt:
      "Au lendemain du lancement de la 4ème édition, deux quotidiens béninois ont consacré leur une du lundi 19 octobre 2026 au CIGIBM, à la résilience face à la dépression et à l'engagement de sa promotrice, Christelle Gnimassou.",
    date: "20 octobre 2026",
    isoDate: "2026-10-20",
    readTime: "5 min",
    author: "ONG Triomphe de l'Intérieur",
    authorRole: "Équipe de communication",
    authorAvatar: "/images/logo-mark.png",
    featuredImage: {
      src: "/images/cigibm/revue-presse-19-octobre-2026.jpg",
      alt: "Les unes de La Droiture et de L'Émergent du lundi 19 octobre 2026, consacrées au CIGIBM",
    },
    body: [
      {
        type: "paragraph",
        text: "Deux jours après le [coup d'envoi du CIGIBM 2026 au Palais des Congrès de Cotonou](/blog/cigibm-2026-coup-d-envoi-palais-des-congres), la presse écrite béninoise s'est emparée du sujet. Dans leurs éditions du lundi 19 octobre 2026, La Droiture et L'Émergent ont chacun placé le congrès en une : l'un sous l'angle de la résilience face à la dépression, l'autre sous celui de l'engagement de sa promotrice et de la parole de sa marraine.",
      },
      {
        type: "heading",
        text: "La Droiture : « Le CIGIBM mise sur la résilience face à la dépression »",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/press1.jpeg",
          alt: "Une de La Droiture, n° 0015 du lundi 19 octobre 2026, avec l'encadré « Le CIGIBM mise sur la résilience face à la dépression »",
        },
        imagePosition: "left",
        imageAspect: "portrait",
        caption: "La Droiture, n° 0015, lundi 19 octobre 2026, une.",
        paragraphs: [
          "Le quotidien béninois d'informations, d'analyses et d'investigations ouvre son édition n° 0015 sur un encadré « Santé mentale et bien-être », qui renvoie à un article en page 10 : « Le CIGIBM mise sur la résilience face à la dépression ».",
          "Le choix du mot est juste. La résilience est précisément ce que le thème de cette édition, « Le vaccin de la dépression », cherche à renforcer : se donner, avant la crise, les ressources pour la traverser, plutôt que d'attendre que la souffrance s'installe.",
        ],
      },
      {
        type: "heading",
        text: "L'Émergent : la promotrice et la marraine à la une",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/press2.jpeg",
          alt: "Une de L'Émergent, n° 983 du lundi 19 octobre 2026, avec en manchette l'engagement de Christelle Gnimassou",
        },
        imagePosition: "right",
        imageAspect: "portrait",
        caption: "L'Émergent, n° 983, lundi 19 octobre 2026, une.",
        paragraphs: [
          "L'Émergent consacre la manchette de son édition n° 983 à la promotrice du congrès : « La promotrice Christelle GNIMASSOU, un engagement renouvelé pour briser le silence autour de la dépression et promouvoir la guérison intérieure ».",
          "En bas de la même une, le journal relaie les mots de la marraine de cette 4ème édition, [Ella Mara Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/), qui résument à eux seuls la raison d'être du congrès.",
        ],
      },
      {
        type: "quote",
        text: "Nous soignons les corps tout en laissant les esprits saigner en silence.",
        cite: "[Ella Mara Wama](https://www.linkedin.com/in/ella-wama-mara-expertegenre/), marraine de la 4ème édition du CIGIBM, citée par L'Émergent (n° 983, 19 octobre 2026)",
      },
      {
        type: "heading",
        text: "Pourquoi cette couverture compte",
      },
      {
        type: "paragraph",
        text: "Selon l'[Organisation mondiale de la Santé](https://www.who.int/fr/news-room/fact-sheets/detail/depression), la dépression touche environ 322 millions de personnes dans le monde, soit 5,2 % des adultes, alors même qu'il existe des traitements efficaces. Entre ces deux réalités, il y a le silence : celui qui retarde le moment de demander de l'aide. Chaque article qui nomme la dépression dans un journal grand public contribue à le rompre.",
      },
      {
        type: "paragraph",
        text: "Pour l'[ONG Triomphe de l'Intérieur](/a-propos), cette visibilité prolonge un travail de fond : sensibiliser avant que la souffrance ne s'installe, puis accompagner dans la durée grâce à la [Méthode R.A.C.I.N.E.S.](/methode-racines), notre cadre d'accompagnement en guérison intérieure.",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm/Coach Christelle.jpg",
          alt: "Portrait de Christelle Eugénie Gnimassou, promotrice du CIGIBM et présidente-fondatrice de l'ONG Triomphe de l'Intérieur",
        },
        imagePosition: "left",
        imageAspect: "portrait",
        heading: "Christelle Gnimassou, quatre éditions au service du même combat",
        paragraphs: [
          "Présidente-fondatrice de l'ONG Triomphe de l'Intérieur, Christelle Eugénie Gnimassou porte le [CIGIBM](/cigibm) depuis sa toute première édition. L'« engagement renouvelé » que salue L'Émergent se lit dans la continuité des thèmes, édition après édition.",
        ],
      },
      {
        type: "list",
        items: [
          "2023, 1ère édition : « La dépression, parlons-en ».",
          "2024, 2ème édition : « Réinvente-toi ».",
          "2025, 3ème édition : « Équilibre ».",
          "2026, 4ème édition : « Le vaccin de la dépression », les 17 et 18 octobre au Palais des Congrès de Cotonou.",
        ],
      },
      {
        type: "heading",
        text: "Une édition suivie de bout en bout par les médias",
      },
      {
        type: "paragraph",
        text: "Ces deux unes s'ajoutent à la couverture qui a accompagné cette édition depuis sa [conférence de presse du 10 octobre](/blog/conference-presse-cigibm-vaccin-de-la-depression), puis le [reportage vidéo d'I COM](https://youtu.be/oN71eH0b_tA) sur le lancement. Les éditions précédentes avaient déjà été relayées, notamment par [Matin Libre](https://matinlibre.com/2025/11/13/congres-international-de-guerison-interieure-et-du-bien-etre-mental-la-3eme-edition-sannonce-sous-le-sceau-de-lequilibre/), [L'Économiste du Bénin](https://leconomistebenin.bj/long-triomphe-de-linterieur-sensibilise-sur-lequilibre/) et [Economia24](https://economia24.bj/2025/11/30/cigibm-2025-christelle-gnimassou-pour-le-bien-etre-mental-de-tous/).",
      },
      {
        type: "paragraph",
        text: "À toutes les rédactions qui ont relayé ce message : merci. Journalistes, pour une interview ou des informations sur le CIGIBM, [contactez l'ONG](/contact).",
      },
      {
        type: "references",
        heading: "Sources",
        items: [
          {
            label:
              "La Droiture, n° 0015, lundi 19 octobre 2026, une : « Le CIGIBM mise sur la résilience face à la dépression » (article en page 10).",
          },
          {
            label:
              "L'Émergent, n° 983, lundi 19 octobre 2026, une : « La promotrice Christelle GNIMASSOU, un engagement renouvelé pour briser le silence autour de la dépression et promouvoir la guérison intérieure ».",
          },
          {
            label:
              "L'Émergent, n° 983, lundi 19 octobre 2026, une : « “Nous soignons les corps tout en laissant les esprits saigner en silence” dixit la marraine [Ella Mara WAMA](https://www.linkedin.com/in/ella-wama-mara-expertegenre/) ».",
          },
          {
            label: "Organisation mondiale de la Santé, « Trouble dépressif (dépression) », principaux repères, 11 septembre 2026.",
            href: "https://www.who.int/fr/news-room/fact-sheets/detail/depression",
          },
          {
            label: "I COM tv, « Guérison intérieure et santé mentale : coup d'envoi de la 4e éd. du CIGBM », YouTube.",
            href: "https://youtu.be/oN71eH0b_tA",
          },
        ],
      },
    ],
  },
  {
    slug: "cigibm-2026-coup-d-envoi-palais-des-congres",
    type: "activite",
    title: "CIGIBM 2026 : coup d'envoi au Palais des Congrès pour guérir les blessures invisibles",
    excerpt:
      "Ce samedi 17 octobre 2026, la 4ème édition du CIGIBM s'est ouverte au Palais des Congrès de Cotonou devant un public nombreux, autour de la santé mentale et de la guérison des blessures invisibles.",
    date: "20 octobre 2026",
    isoDate: "2026-10-20",
    readTime: "3 min",
    author: "ONG Triomphe de l'Intérieur",
    authorRole: "Équipe de communication",
    authorAvatar: "/images/logo-mark.png",
    featuredImage: {
      src: "/images/cigibm/Cover CIGIBM1 2026.png",
      alt: "Christelle Eugénie Gnimassou, au centre, devant le panneau officiel du CIGIBM 2026 lors du lancement de la 4ème édition",
      position: "top",
    },
    body: [
      {
        type: "paragraph",
        text: "Le coup d'envoi a été officiellement donné ce samedi 17 octobre 2026 au Palais des Congrès de Cotonou. Pour sa 4ème édition, le Congrès International de Guérison Intérieure et de Bien-être Mental (CIGIBM) a réuni un public nombreux autour d'une conviction simple : la santé mentale se soigne aussi, et les blessures qu'on ne voit pas méritent qu'on s'y arrête.",
      },
      {
        type: "video",
        youtubeId: "oN71eH0b_tA",
        title: "Guérison intérieure et santé mentale : coup d'envoi de la 4e édition du CIGIBM",
        caption: "Reportage réalisé par I COM, structure de production audiovisuelle et de communication.",
      },
      {
        type: "heading",
        text: "Les blessures invisibles au centre de la salle",
      },
      {
        type: "paragraph",
        text: "Ce que l'on porte en silence ne se voit pas, mais finit toujours par peser. C'est à ces blessures-là que le CIGIBM consacre ses journées, avec un thème pensé comme une réponse : « Le vaccin de la dépression ». L'idée n'est pas d'attendre que la souffrance s'installe pour agir, mais de donner à chacun les moyens de la reconnaître et de s'en protéger, pour soi comme pour ses proches.",
      },
      {
        type: "quote",
        text: "Une blessure qu'on ne nomme pas ne guérit pas.",
      },
      {
        type: "heading",
        text: "Christelle Gnimassou, un engagement qui ne faiblit pas",
      },
      {
        type: "paragraph",
        text: "L'événement est porté par Christelle Eugénie Gnimassou, présidente-fondatrice de l'ONG Triomphe de l'Intérieur. Depuis plusieurs années, malgré les difficultés et sans jamais se décourager, elle œuvre pour offrir un espace d'écoute et de prise en charge accessible à tous, là où la santé mentale reste encore trop souvent un sujet tabou.",
      },
      {
        type: "paragraph",
        text: "Le CIGIBM est né de son propre parcours. Quatre éditions plus tard, il reste fidèle à la même promesse : que plus personne ne porte seul ce qu'il vit en silence.",
      },
      {
        type: "heading",
        text: "Et après le congrès ?",
      },
      {
        type: "paragraph",
        text: "La guérison ne s'arrête pas à la sortie de la salle. L'ONG Triomphe de l'Intérieur poursuit son accompagnement tout au long de l'année, à travers la Méthode R.A.C.I.N.E.S., des ateliers et un accompagnement individuel. Si ce reportage vous parle, ou si vous pensez à quelqu'un qui aurait besoin d'en parler, écrivez-nous : c'est souvent le premier pas qui compte le plus.",
      },
      {
        type: "links",
        heading: "Pour aller plus loin",
        items: [
          { label: "Regarder le reportage d'I COM sur YouTube", href: "https://youtu.be/oN71eH0b_tA" },
          { label: "La chaîne I COM tv", href: "https://www.youtube.com/@iliassouchitou825" },
        ],
      },
    ],
  },
  {
    slug: "conference-presse-cigibm-vaccin-de-la-depression",
    type: "activite",
    title:
      "Journée mondiale de la santé mentale : le CIGIBM 4 dévoile « le vaccin de la dépression » en conférence de presse",
    excerpt:
      "Le jour même de la Journée mondiale de la santé mentale, Triomphe de l'Intérieur a réuni la presse à Cotonou pour annoncer la 4ème édition du CIGIBM et son thème.",
    date: "10 octobre 2026",
    isoDate: "2026-10-10",
    readTime: "4 min",
    author: "Coach Christelle Gnimassou",
    authorRole: "Présidente-fondatrice, Triomphe de l'Intérieur",
    authorAvatar: "/images/author-christelle-gnimassou.jpg",
    featuredImage: {
      src: "/images/cigibm-edition-4/conference-presse/christelle-podium-annonce.jpg",
      alt: "Christelle Eugénie Gnimassou s'exprime au pupitre devant la presse, entourée des bannières de l'ONG Triomphe de l'Intérieur et de CG Consulting",
    },
    body: [
      {
        type: "paragraph",
        text: "Le 10 octobre, comme chaque année, le monde a marqué la Journée mondiale de la santé mentale, une date qui rappelle qu'un mal invisible ne cesse pas d'exister parce qu'on refuse d'en parler. Au Bénin, c'est précisément ce jour-là que Triomphe de l'Intérieur a choisi de marquer l'occasion autrement : en convoquant la presse.",
      },
      {
        type: "paragraph",
        text: "Le 10 octobre 2026, à la Fondation Friedrich Ebert, à Cotonou, journalistes, partenaires et membres de l'équipe se sont retrouvés pour une conférence de presse avec un seul objectif : annoncer officiellement la 4ème édition du Congrès International de Guérison Intérieure et de Bien-être Mental (CIGIBM), et son thème.",
      },
      {
        type: "heading",
        text: "Le vaccin de la dépression, une image pour un combat concret",
      },
      {
        type: "paragraph",
        text: "« Le vaccin de la dépression. » Le thème choisi pour cette édition ne laisse personne indifférent, et c'est voulu. Comme un vaccin, la prévention en santé mentale n'agit pas après coup : elle agit avant, en donnant à chacun les outils pour reconnaître les premiers signes, les siens et ceux d'un proche, avant que la dépression ne s'installe.",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm-edition-4/conference-presse/christelle-podium-micro.jpg",
          alt: "Christelle Eugénie Gnimassou au micro, devant les bannières ONG Triomphe de l'Intérieur et CG Consulting",
        },
        imagePosition: "right",
        heading: "Un message porté personnellement",
        paragraphs: [
          "Face aux caméras, Christelle Eugénie Gnimassou, présidente-fondatrice de l'ONG, a présenté les grandes lignes du congrès à venir : le 17 octobre 2026, dès 9h00, au Palais des Congrès de Cotonou, sur inscription gratuite.",
          "Elle est aussi revenue sur la raison d'être du CIGIBM depuis sa création : faire de la santé mentale un sujet qu'on aborde à voix haute, et non plus un secret qu'on porte seul.",
        ],
      },
      {
        type: "heading",
        text: "Une équipe au complet pour porter l'annonce",
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm-edition-4/conference-presse/equipe-ong-triomphe.jpg",
          alt: "Membres de l'équipe de l'ONG Triomphe de l'Intérieur posant ensemble après la conférence de presse",
        },
        imagePosition: "left",
        heading: "L'équipe de Triomphe de l'Intérieur",
        paragraphs: [
          "Une annonce de cette ampleur ne se prépare jamais seule. Derrière la présidente-fondatrice, c'est toute l'équipe de l'ONG qui s'est mobilisée pour cette conférence de presse, de la logistique à l'accueil des journalistes.",
        ],
      },
      {
        type: "imageText",
        image: {
          src: "/images/cigibm-edition-4/conference-presse/equipe-partenaires-presse.jpg",
          alt: "Équipe de l'ONG Triomphe de l'Intérieur et partenaires, dont CG Consulting, réunis après la conférence de presse",
        },
        imagePosition: "right",
        heading: "Des partenaires engagés à nos côtés",
        paragraphs: [
          "Cette mobilisation dépasse l'ONG elle-même. Partenaires, dont le cabinet CG Consulting, collaborateurs et membres de la presse réunis sur cette photo témoignent d'une dynamique qui dépasse une seule organisation : celle d'un réseau grandissant autour de la santé mentale au Bénin.",
        ],
      },
      {
        type: "heading",
        text: "La presse a répondu présent",
      },
      {
        type: "paragraph",
        text: "Trois médias ont fait le déplacement pour couvrir l'annonce : I COM TV, le journal Fraternité et le groupe de presse spécialisé Éduc'Action. Leur présence confirme l'intérêt croissant, au Bénin, pour les sujets de santé mentale, longtemps restés en marge du débat public.",
      },
      {
        type: "links",
        heading: "Les médias présents à la conférence",
        items: [
          { label: "I COM TV", href: "https://www.youtube.com/channel/UCpC5j0yGfCs0ss4WWsQjmFQ" },
          { label: "Fraternité", href: "https://fraternite.bj/" },
          { label: "Éduc'Action", href: "https://eduactions.bj/" },
        ],
      },
      {
        type: "paragraph",
        text: "Rendez-vous le 17 octobre 2026, dès 9h00, au Palais des Congrès de Cotonou, pour la 4ème édition du CIGIBM. La participation est gratuite, sur inscription.",
      },
    ],
  },
  {
    slug: "pourquoi-le-mental-dabord-femme-celibataire",
    type: "article",
    title: "Pourquoi le mental d'abord si tu es une femme célibataire ?",
    excerpt:
      "Avant de chercher la bonne personne, il y a une question plus urgente à te poser : qui es-tu, quand personne ne te regarde ?",
    date: "16 août 2026",
    isoDate: "2026-08-16",
    readTime: "6 min",
    author: "Coach Christelle Gnimassou",
    authorRole: "Présidente-fondatrice, Triomphe de l'Intérieur",
    authorAvatar: "/images/author-christelle-gnimassou.jpg",
    featuredImage: {
      src: "/images/blog-mental-femme-celibataire.jpg",
      alt: "Portrait d'une femme pensive, le visage posé sur ses mains",
      credit: "Photo : Anna Shvets / Pexels",
    },
    body: [
      {
        type: "paragraph",
        text: "« Et toi, c'est pour quand ? » Si tu es une femme célibataire, tu connais la question. Elle arrive à chaque mariage, chaque fête de fin d'année, chaque coup de fil avec une tata. Elle sous-entend que ta vie est en pause, en attente de quelqu'un d'autre pour commencer vraiment.",
      },
      {
        type: "paragraph",
        text: "Et sous la pression, beaucoup de femmes se mettent à chercher la solution au mauvais endroit : la bonne personne, la bonne rencontre, le bon timing. Alors qu'il y a une question plus urgente, qu'on nous apprend rarement à nous poser : qui es-tu, quand personne ne te regarde ?",
      },
      {
        type: "heading",
        text: "La pression ne vient jamais seule",
      },
      {
        type: "paragraph",
        text: "Derrière « et toi, c'est pour quand ? », il y a souvent une accumulation : la comparaison avec les amies qui « ont réussi » à se marier, la peur de décevoir une famille, l'angoisse de l'horloge biologique qu'on agite comme une menace. Cette pression ne cherche pas à te faire du bien. Elle cherche à te faire bouger, vite, avant que tu aies eu le temps de savoir ce que tu veux vraiment.",
      },
      {
        type: "paragraph",
        text: "Le problème, ce n'est pas d'avoir envie d'aimer et d'être aimée. C'est de laisser la pression choisir à ta place, au point d'accepter la première personne disponible, ou de rester dans une relation qui abîme, seulement pour ne plus avoir à répondre à la question.",
      },
      {
        type: "imageText",
        image: {
          src: "/images/blog-mental-femme-celibataire-journaling.jpg",
          alt: "Femme assise sur son lit, en train d'écrire dans un carnet, lumière du matin",
        },
        imagePosition: "left",
        heading: "Se marier pour de mauvaises raisons coûte plus cher que d'attendre",
        paragraphs: [
          "Une union construite sur la peur de rester seule ne guérit jamais cette peur, elle la déplace. On se retrouve à reproduire les mêmes schémas, à choisir les mêmes profils, à répéter les mêmes blessures, simplement avec un visage différent en face.",
          "C'est pour ça que le travail intérieur vient avant, pas après. Comprendre pourquoi on attire certaines dynamiques, d'où vient cette peur de ne pas être « assez », ce que l'on porte encore d'un père absent, d'une mère blessée, d'une première rupture jamais digérée : c'est ce travail qui change qui l'on choisit ensuite, et comment on se laisse aimer.",
          "Une femme qui se connaît, qui a fait la paix avec son histoire, ne cherche plus quelqu'un pour se sentir complète. Elle cherche quelqu'un avec qui construire, ce qui n'est pas du tout la même recherche, ni la même vie ensuite.",
        ],
      },
      {
        type: "heading",
        text: "Ce que « le mental d'abord » veut dire concrètement",
      },
      {
        type: "paragraph",
        text: "Ce n'est pas une formule abstraite. Concrètement, ça veut dire :",
      },
      {
        type: "list",
        items: [
          "Identifier les schémas qui reviennent dans tes relations, plutôt que de blâmer « la malchance » ou « les hommes d'aujourd'hui ».",
          "Apprendre à poser des limites sans culpabiliser, y compris avec la famille qui presse.",
          "Reconstruire ton estime de toi en dehors du regard d'un partenaire, pour ne plus en dépendre entièrement.",
          "T'entourer de personnes et d'espaces où tu peux parler sans être jugée, ni renvoyée à ton statut marital.",
          "Accepter qu'attendre, quand c'est un choix conscient et non une fuite, n'est jamais du temps perdu.",
        ],
      },
      {
        type: "quote",
        text: "Tu n'as pas besoin d'être choisie pour être entière. Tu l'es déjà, tu as juste besoin qu'on te le rappelle assez souvent pour finir par y croire.",
      },
      {
        type: "heading",
        text: "Tu n'as pas à faire ce travail seule",
      },
      {
        type: "paragraph",
        text: "C'est exactement ce que nous accompagnons à Triomphe de l'Intérieur : comprendre son histoire, désamorcer les schémas qui se répètent, et se reconstruire une base solide, avant de chercher à construire à deux. La Méthode R.A.C.I.N.E.S. donne un cadre pour ce travail, et le CIGIBM, notre congrès annuel, en fait un moment collectif : des centaines de femmes qui se posent les mêmes questions, dans la même salle, sans honte.",
      },
      {
        type: "paragraph",
        text: "Si cet article résonne, la meilleure prochaine étape n'est pas d'attendre le prochain commentaire de famille pour réagir. C'est de réserver un moment pour toi, dès maintenant.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getSortedPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1));
}
