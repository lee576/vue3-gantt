/**
 * French language pack
 * Pack de langue française
 */
export default {
  // Common
  common: {
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    close: 'Fermer',
    export: 'Exporter',
    import: 'Importer',
    config: 'Configuration',
    settings: 'Paramètres',
    theme: 'Thème',
    to: 'à',
    selectDate: 'Sélectionner la date'
  },
  
  // Date & Time
  date: {
    year: 'Année',
    month: 'Mois',
    day: 'Jour',
    hour: 'Heure',
    week: 'Semaine',
    today: "Aujourd'hui",
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim',
    january: 'Janvier',
    february: 'Février',
    march: 'Mars',
    april: 'Avril',
    may: 'Mai',
    june: 'Juin',
    july: 'Juillet',
    august: 'Août',
    september: 'Septembre',
    october: 'Octobre',
    november: 'Novembre',
    december: 'Décembre'
  },
  
  // Date Format
  dateFormat: {
    full: 'DD MMMM YYYY',
    short: 'DD/MM/YYYY',
    monthDay: 'DD MMM',
    yearMonth: 'MMMM YYYY'
  },
  
  // View Mode
  viewMode: {
    quarter: 'Trimestre',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    hour: 'Heure',
    daySubMode: 'Sous-mode jour',
    fullDay: 'Journée complète',
    halfDay: 'Demi-journée',
    '15min': '15 minutes',
    '30min': '30 minutes'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: 'trimestres',
    months: 'mois',
    weeks: 'semaines',
    days: 'jours',
    hours: 'heures',
    minutes: 'minutes',
    hoursAndMinutes: '{hours}h {minutes}min'
  },
  
  // Task
  task: {
    addRoot: 'Ajouter une tâche racine',
    addSub: 'Ajouter une sous-tâche',
    remove: 'Supprimer la tâche',
    edit: 'Modifier la tâche',
    name: 'Nom de la tâche',
    priority: 'Priorité',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    duration: 'Durée',
    progress: 'Progrès',
    serialNumber: 'N°',
    type: 'Type',
    taskType: 'Tâche',
    projectType: 'Projet',
    milestoneType: 'Jalon'
  },
  
  // Link Legend
  link: {
    legend: 'Légende des liens',
    parentChild: 'Parent-Enfant',
    finishToStart: 'Fin-Début',
    startToStart: 'Début-Début',
    finishToFinish: 'Fin-Fin',
    startToFinish: 'Début-Fin',
    fs: 'FD',
    ss: 'DD',
    ff: 'FF',
    sf: 'DF',
    pc: 'PE'
  },
  
  // Config Panel
  configPanel: {
    title: 'Configuration Gantt',
    themeSettings: 'Paramètres du thème',
    linkSettings: 'Paramètres des liens',
    languageSettings: 'Paramètres de langue',
    currentTheme: 'Actuel',
    previewTheme: 'Aperçu',
    exportConfig: 'Exporter la configuration',
    importConfig: 'Importer la configuration',
    
    // Link Configuration
    linkConfig: {
      info: 'Configurer les liens de dépendance des tâches (Fin-Début, Début-Début, etc.)',
      pathType: 'Type de chemin',
      straight: 'Droit',
      bezier: 'Bézier',
      rightAngle: 'Angle droit',
      color: 'Couleur',
      width: 'Épaisseur de ligne',
      dashStyle: 'Style de tiret',
      solid: 'Solide',
      shortDash: 'Tiret court',
      mediumDash: 'Tiret moyen',
      longDash: 'Tiret long',
      dotDash: 'Point-tiret',
      curvature: 'Courbure',
      offset: 'Distance de décalage',
      smoothCorners: 'Coins lisses',
      cornerRadius: 'Rayon du coin',
      showArrow: 'Afficher la flèche',
      arrowSize: 'Taille de la flèche',
      arrowColor: 'Couleur de la flèche',
      syncColor: 'Synchroniser',
      dashAnimation: 'Animation de tiret',
      animationSpeed: "Vitesse d'animation",
      showLabels: 'Afficher les étiquettes',
      labelColor: "Couleur de l'étiquette",
      fontSize: 'Taille de police',
      typeColors: 'Couleurs des types de dépendance',
      parentChildStyle: 'Style de lien parent-enfant',
      parentChildInfo: 'Afficher la relation hiérarchique entre les tâches parent et enfant'
    }
  },
  
  // Theme
  theme: {
    metro: 'Metro',
    light: 'Clair',
    dark: 'Sombre',
    colorful: 'Coloré',
    ocean: 'Océan',
    apple: 'Apple',
    classic: 'Classique',
    liquidGlass: 'Verre Liquide',
    metroDesc: 'Style Metro Windows classique',
    lightDesc: 'Style clair frais et lumineux',
    darkDesc: 'Style sombre élégant et professionnel',
    colorfulDesc: 'Style coloré vibrant',
    oceanDesc: 'Style océan calme et confortable',
    appleDesc: 'Style macOS minimaliste et élégant',
    classicDesc: 'Style business traditionnel et stable',
    liquidGlassDesc: 'Effet Verre Liquide iOS 26 avec fluidité translucide'
  },
  
  // Date Picker
  datePicker: {
    selectDate: 'Sélectionner la date',
    clearDate: 'Effacer la date'
  },
  
  // Column Settings
  columnSettings: {
    title: 'Paramètres de colonne',
    desc: 'Sélectionner les colonnes à afficher',
    showAll: 'Tout afficher',
    hideAll: 'Tout masquer',
    reset: 'Réinitialiser par défaut'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: 'Ajouter une sous-tâche',
    removeTask: 'Supprimer la tâche actuelle',
    syncArrowColor: 'Synchroniser avec la couleur de la ligne',
    close: 'Fermer',
    columnSettings: 'Paramètres de colonne'
  }
};
