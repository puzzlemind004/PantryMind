/**
 * Dictionnaire français — libellés centralisés (spec §10.9).
 * Aucune chaîne en dur dans les templates : tout passe par le pipe `t`.
 * L'ajout d'une langue = un nouveau fichier respectant ce même type.
 */
export const fr = {
  app: {
    name: 'Cooking',
    loading: 'Chargement…',
    retry: 'Réessayer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    back: 'Retour',
    confirm: 'Confirmer',
    search: 'Rechercher',
    error: 'Une erreur est survenue',
  },

  nav: {
    stock: 'Stock',
    planning: 'Planning',
    recipes: 'Recettes',
    shopping: 'Courses',
    profile: 'Profil',
  },

  auth: {
    login: {
      title: 'Connexion',
      email: 'Adresse email',
      password: 'Mot de passe',
      submit: 'Se connecter',
      noAccount: 'Pas encore de compte ?',
      signupLink: 'Créer un compte',
      invalidCredentials: 'Email ou mot de passe incorrect',
    },
    signup: {
      title: 'Créer un compte',
      fullName: 'Nom complet',
      email: 'Adresse email',
      password: 'Mot de passe (8 caractères minimum)',
      passwordConfirmation: 'Confirmer le mot de passe',
      submit: "S'inscrire",
      hasAccount: 'Déjà un compte ?',
      loginLink: 'Se connecter',
      emailTaken: 'Cette adresse email est déjà utilisée',
    },
    logout: 'Se déconnecter',
  },

  onboarding: {
    title: 'Bienvenue !',
    subtitle: 'Créez votre foyer ou rejoignez-en un pour commencer.',
    createTitle: 'Créer un foyer',
    householdName: 'Nom du foyer',
    householdNamePlaceholder: 'Ex. : Maison, Coloc rue Vaugirard…',
    create: 'Créer le foyer',
    joinTitle: 'Rejoindre un foyer',
    joinSubtitle: "Saisissez le code d'invitation partagé par un membre.",
    invitationCode: "Code d'invitation",
    join: 'Rejoindre',
    invalidCode: 'Code invalide ou expiré',
  },

  household: {
    title: 'Foyer',
    members: 'Membres',
    invitations: 'Invitations',
    createInvitation: 'Inviter un membre',
    invitationHint: 'Partagez ce code, il expire dans 7 jours :',
    storageLocations: 'Emplacements de stockage',
    addLocation: 'Ajouter un emplacement',
    locationName: "Nom de l'emplacement",
    mealTypes: 'Types de repas',
    roles: {
      admin: 'Administrateur',
      member: 'Membre',
      viewer: 'Lecture seule',
    },
    locationTypes: {
      fridge: 'Frigo',
      freezer: 'Congélateur',
      pantry: 'Placard',
      cellar: 'Cave',
      other: 'Autre',
    },
    switch: 'Changer de foyer',
    leave: 'Quitter le foyer',
  },

  stock: {
    title: 'Stock',
    empty: 'Votre stock est vide. Ajoutez votre premier produit !',
    add: 'Ajouter',
    scan: 'Scanner',
    searchPlaceholder: 'Rechercher un produit…',
    filters: {
      all: 'Tout',
      expiringSoon: 'À consommer vite',
      byLocation: 'Par emplacement',
    },
    expired: 'Périmé',
    expiresToday: "Périme aujourd'hui",
    expiresInDays: 'Périme dans {days} j',
    quantity: 'Quantité',
    unit: 'Unité',
    location: 'Emplacement',
    expiryDate: 'Date de péremption (optionnel)',
    consume: 'Consommer',
    consumeAll: 'Tout consommer',
    discard: 'Jeter',
    discardReasons: {
      trashed: 'Jeté',
      lost: 'Perdu',
      given: 'Donné',
    },
    addTitle: 'Ajouter au stock',
    selectProduct: 'Choisir un produit',
    createProduct: 'Créer le produit « {name} »',
    productName: 'Nom du produit',
    history: 'Historique',
    movements: {
      added: 'Ajouté',
      consumed: 'Consommé',
      discarded: 'Jeté',
      corrected: 'Corrigé',
      moved: 'Déplacé',
      purchased: 'Acheté',
    },
  },

  scan: {
    title: 'Scanner un code-barres',
    instructions: 'Visez le code-barres du produit',
    notSupported: "Votre navigateur ne prend pas en charge le scan. Utilisez l'ajout manuel.",
    searching: 'Recherche du produit…',
    found: 'Produit trouvé',
    notFound: 'Produit inconnu — créez-le manuellement.',
    cameraError: "Impossible d'accéder à la caméra",
  },

  units: {
    g: 'g',
    kg: 'kg',
    mg: 'mg',
    ml: 'ml',
    cl: 'cl',
    l: 'l',
    unit: 'unité(s)',
  },

  planning: {
    title: 'Planning',
    comingSoon: 'La planification des repas arrive au Lot 2.',
  },

  recipes: {
    title: 'Recettes',
    comingSoon: 'La gestion des recettes arrive au Lot 2.',
  },

  shopping: {
    title: 'Courses',
    comingSoon: 'La liste de courses automatique arrive au Lot 3.',
  },

  profile: {
    title: 'Profil',
  },
} as const

export type Dictionary = typeof fr
