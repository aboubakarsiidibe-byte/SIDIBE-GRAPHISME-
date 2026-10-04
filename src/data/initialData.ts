import { Project, Task } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Refonte Identité Visuelle & Charte Graphique',
    client: 'Maison Kalia (Paris)',
    clientEmail: 'contact@maisonkalia.com',
    clientPhone: '+33 6 42 19 88 02',
    type: 'Identité visuelle',
    budget: 0,
    currency: 'XOF',
    paymentStatus: 'Acompte 50% versé',
    startDate: '2026-09-05',
    deadline: '2026-09-25',
    links: [
      {
        id: 'link-1',
        title: 'Figma Workspace Brandbook',
        url: 'https://figma.com/@sidibestudio/kalia-brand',
        category: 'Figma',
      },
      {
        id: 'link-2',
        title: 'Google Drive Assets & Moodboard',
        url: 'https://drive.google.com/drive/kalia-assets',
        category: 'Google Drive',
      },
      {
        id: 'link-3',
        title: 'Notion Brief Client',
        url: 'https://notion.so/kalia-rebranding-brief',
        category: 'Notion',
      },
    ],
    notesBrief:
      'Positionnement haut de gamme éco-responsable. Palette terracotta, vert sauge et écru. Typographie serif moderne combinée avec une sans géométrique épurée. Livrables : Logo principal, secondaires, pictogrammes, typographies, déclinaison papeterie et guidelines PDF 32 pages.',
    colorTag: '#f59e0b', // Amber
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Packs Réseaux Sociaux & Templates Carrousels',
    client: 'Nova Sport Club',
    clientEmail: 'alexandre@novasport.fr',
    clientPhone: '+33 7 88 12 34 56',
    type: 'Réseaux sociaux',
    budget: 0,
    currency: 'XOF',
    paymentStatus: 'Devis signé',
    startDate: '2026-09-12',
    deadline: '2026-09-22',
    links: [
      {
        id: 'link-4',
        title: 'Figma Templates Instagram',
        url: 'https://figma.com/@sidibestudio/nova-templates',
        category: 'Figma',
      },
      {
        id: 'link-5',
        title: 'Dropbox Photos Shooting',
        url: 'https://dropbox.com/sh/novasport-shoot',
        category: 'Dropbox',
      },
    ],
    notesBrief:
      'Création de 12 templates Instagram modifiables (stories, posts, carrousels informatifs). Ambiance néon dynamique, typographie bold impactante, contrastes marqués noir & vert fluo.',
    colorTag: '#10b981', // Emerald
    createdAt: '2026-09-12T10:30:00Z',
  },
  {
    id: 'proj-3',
    name: 'Packaging Gamme Cosmétique & Étiquettes Flacons',
    client: 'Flore & Sens Bio',
    clientEmail: 'helene@floresens.com',
    clientPhone: '+33 6 11 22 33 44',
    type: 'Packaging',
    budget: 0,
    currency: 'XOF',
    paymentStatus: 'Acompte 30% versé',
    startDate: '2026-09-01',
    deadline: '2026-09-21', // TODAY
    links: [
      {
        id: 'link-6',
        title: 'Dossier Technique Imprimeur (Gabarits Dieline)',
        url: 'https://drive.google.com/drive/packaging-flore',
        category: 'Google Drive',
      },
      {
        id: 'link-7',
        title: 'Brand Kit & Nuancier Pantone',
        url: 'https://notion.so/flore-sens-pantone',
        category: 'Brand kit',
      },
    ],
    notesBrief:
      'Gamme de 4 sérums biologiques. Contraintes techniques : dorure à chaud or mat, vernis sélectif braille, papier kraft certifié FSC. Respect strict des mentions légales INCI cosmétiques.',
    colorTag: '#8b5cf6', // Violet
    createdAt: '2026-09-01T14:00:00Z',
  },
  {
    id: 'proj-4',
    name: 'UI Design & Système de Composants Web',
    client: 'Bloom Architecture',
    clientEmail: 'contact@bloom-archi.ch',
    type: 'Web',
    budget: 0,
    currency: 'XOF',
    paymentStatus: 'Acompte 50% versé',
    startDate: '2026-09-10',
    deadline: '2026-10-02',
    links: [
      {
        id: 'link-8',
        title: 'Figma UI Kit & Design System',
        url: 'https://figma.com/@sidibestudio/bloom-ui',
        category: 'Figma',
      },
    ],
    notesBrief:
      'Site vitrine portfolio d’architectes d’intérieur. Mise en page minimaliste suisse, grille asymétrique fluide, transitions douces, mode clair/sombre, typographie Neue Haas Grotesk.',
    colorTag: '#3b82f6', // Blue
    createdAt: '2026-09-10T11:15:00Z',
  },
  {
    id: 'proj-5',
    name: 'Affiches Print 4x3 & Dossier Sponsoring',
    client: 'Association Pulsar (Festival Nuits Sonores)',
    clientEmail: 'prod@pulsar-fest.org',
    type: 'Print',
    budget: 0,
    currency: 'XOF',
    paymentStatus: 'Soldé / Payé',
    startDate: '2026-08-25',
    deadline: '2026-09-18', // OVERDUE
    links: [
      {
        id: 'link-9',
        title: 'PDF HD Imprimeur & Certificats Fogra39',
        url: 'https://drive.google.com/drive/pulsar-print',
        category: 'Google Drive',
      },
    ],
    notesBrief:
      'Création des affiches abribus et 4x3m pour la programmation officielle. Déclinaisons en format flyer A5 et dossier de presse 16 pages agrafé.',
    colorTag: '#ec4899', // Pink
    createdAt: '2026-08-25T08:45:00Z',
  },
];

export const INITIAL_TASKS: Task[] = [
  // Tâche en retard
  {
    id: 'task-1',
    projectId: 'proj-5',
    title: 'Validation Bon À Tirer (BAT) Imprimeur Affiches 4x3',
    description: 'Vérifier la surimpression des noirs et l’étalonnage chromatique CMJN avant lancement presse.',
    status: 'En révision',
    dueDate: '2026-09-18', // En retard de 3 jours
    estimatedHours: 2.5,
    priority: 'Urgente',
    subtasks: [
      { id: 'sub-1', title: 'Contrôle PDF HD avec Acrobat Preflight', completed: true },
      { id: 'sub-2', title: 'Signature du BAT numérique', completed: false },
      { id: 'sub-3', title: 'Envoi confirmation à l’imprimeur', completed: false },
    ],
    tags: ['Print', 'BAT', 'Urgent'],
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-3',
    title: 'Finalisation des tracés vectoriels des étiquettes flacons',
    description: 'Ajuster les fonds perdus de 3mm et les cotes du vernis sélectif sur les calques techniques.',
    status: 'En cours',
    dueDate: '2026-09-21', // TODAY
    estimatedHours: 4,
    priority: 'Haute',
    subtasks: [
      { id: 'sub-4', title: 'Sérum Éclat N°1 - Flacon 50ml', completed: true },
      { id: 'sub-5', title: 'Sérum Nuit Réparateur - Flacon 30ml', completed: true },
      { id: 'sub-6', title: 'Huile Botanique - Flacon 100ml', completed: false },
      { id: 'sub-7', title: 'Export PDF X-4 avec calque Dieline séparé', completed: false },
    ],
    tags: ['Packaging', 'Illustrator', 'Livrable'],
    createdAt: '2026-09-16T14:30:00Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Présentation des pistes de logo & monogramme Kalia',
    description: 'Envoyer les 3 déclinaisons typographiques et simulations 3D de packaging pour validation cliente.',
    status: 'En attente de validation client',
    dueDate: '2026-09-20', // Était due hier, en attente
    clientValidationRequestedDate: '2026-09-19',
    estimatedHours: 5,
    priority: 'Haute',
    subtasks: [
      { id: 'sub-8', title: 'Deck de présentation PDF 15 slides', completed: true },
      { id: 'sub-9', title: 'Lien Figma prototype interactif', completed: true },
      { id: 'sub-10', title: 'Email récapitulatif avec questions directes', completed: true },
    ],
    tags: ['Branding', 'Client', 'Revue'],
    createdAt: '2026-09-14T10:00:00Z',
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    title: 'Déclinaison des 6 templates Carrousel Instagram',
    description: 'Mettre en page les carrousels conseils d’entraînement avec la nouvelle charte Nova Sport.',
    status: 'En cours',
    dueDate: '2026-09-22', // Demain
    estimatedHours: 3.5,
    priority: 'Moyenne',
    subtasks: [
      { id: 'sub-11', title: 'Structure slides 1 à 5 sur Figma', completed: true },
      { id: 'sub-12', title: 'Intégration des photos shooting détourées', completed: false },
      { id: 'sub-13', title: 'Composants modifiables avec auto-layout', completed: false },
    ],
    tags: ['Social Media', 'Figma'],
    createdAt: '2026-09-17T11:00:00Z',
  },
  {
    id: 'task-5',
    projectId: 'proj-4',
    title: 'Wireframes & UI Kit Page d’accueil Bloom Architecture',
    description: 'Concevoir la grille asymétrique responsive desktop et mobile avec galerie projets.',
    status: 'À faire',
    dueDate: '2026-09-24', // Cette semaine
    estimatedHours: 6,
    priority: 'Moyenne',
    subtasks: [
      { id: 'sub-14', title: 'Architecture de l’information & zoning', completed: false },
      { id: 'sub-15', title: 'Navigation sticky minimaliste', completed: false },
      { id: 'sub-16', title: 'Grille d’affichage projets photo HD', completed: false },
    ],
    tags: ['Web UI', 'Figma', 'Architecture'],
    createdAt: '2026-09-18T16:00:00Z',
  },
  {
    id: 'task-6',
    projectId: 'proj-1',
    title: 'Rédaction des règles d’usage de la charte graphique',
    description: 'Définir les zones d’exclusion, tailles minimales et interdits du logo.',
    status: 'À faire',
    dueDate: '2026-09-25', // Vendredi
    estimatedHours: 4,
    priority: 'Moyenne',
    subtasks: [
      { id: 'sub-17', title: 'Règles de proportions & marges de sécurité', completed: false },
      { id: 'sub-18', title: 'Guide des contrastes et accessibilité WCAG', completed: false },
    ],
    tags: ['Branding', 'Guidelines'],
    createdAt: '2026-09-19T09:30:00Z',
  },
  {
    id: 'task-7',
    projectId: 'proj-5',
    title: 'Génération et archivage des livrables finaux HD',
    description: 'Envoi du dossier zippé complet avec polices vectorisées et exports EPS/PDF.',
    status: 'Terminé',
    dueDate: '2026-09-17',
    completedAt: '2026-09-17T17:30:00Z',
    estimatedHours: 2,
    priority: 'Basse',
    subtasks: [
      { id: 'sub-19', title: 'Export vectoriel EPS & SVG', completed: true },
      { id: 'sub-20', title: 'Vérification conformité imprimeur', completed: true },
    ],
    tags: ['Print', 'Livrable'],
    createdAt: '2026-09-14T08:00:00Z',
  },
  {
    id: 'task-8',
    projectId: 'proj-2',
    title: 'Intégration du logo Nova Sport en motion teaser 5s',
    description: 'Animation du symbole en rebond néon pour story d’ouverture.',
    status: 'À faire',
    dueDate: '2026-09-23',
    estimatedHours: 3,
    priority: 'Basse',
    subtasks: [
      { id: 'sub-21', title: 'Storyboard After Effects 3 vignettes', completed: false },
      { id: 'sub-22', title: 'Export MP4 H.264 & GIF optimisé', completed: false },
    ],
    tags: ['Motion', 'Social'],
    createdAt: '2026-09-19T15:20:00Z',
  },
];
