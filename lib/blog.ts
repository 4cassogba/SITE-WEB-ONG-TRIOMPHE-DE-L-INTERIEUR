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
  | { type: "video"; youtubeId: string; title: string; caption?: string };

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
          "En bas de la même une, le journal relaie les mots de la marraine de cette 4ème édition, Ella Mara Wama, qui résument à eux seuls la raison d'être du congrès.",
        ],
      },
      {
        type: "quote",
        text: "Nous soignons les corps tout en laissant les esprits saigner en silence.",
        cite: "Ella Mara Wama, marraine de la 4ème édition du CIGIBM, citée par L'Émergent (n° 983, 19 octobre 2026)",
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
              "L'Émergent, n° 983, lundi 19 octobre 2026, une : « “Nous soignons les corps tout en laissant les esprits saigner en silence” dixit la marraine Ella Mara WAMA ».",
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
