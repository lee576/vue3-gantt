/**
 * German language pack
 * Deutsches Sprachpaket
 */
export default {
  // Common
  common: {
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    close: 'Schließen',
    export: 'Exportieren',
    import: 'Importieren',
    config: 'Konfiguration',
    settings: 'Einstellungen',
    theme: 'Thema',
    to: 'bis',
    selectDate: 'Datum auswählen'
  },
  
  // Date & Time
  date: {
    year: 'Jahr',
    month: 'Monat',
    day: 'Tag',
    hour: 'Stunde',
    week: 'Woche',
    today: 'Heute',
    monday: 'Mo',
    tuesday: 'Di',
    wednesday: 'Mi',
    thursday: 'Do',
    friday: 'Fr',
    saturday: 'Sa',
    sunday: 'So',
    january: 'Januar',
    february: 'Februar',
    march: 'März',
    april: 'April',
    may: 'Mai',
    june: 'Juni',
    july: 'Juli',
    august: 'August',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Dezember'
  },
  
  // Date Format
  dateFormat: {
    full: 'DD. MMMM YYYY',
    short: 'DD.MM.YYYY',
    monthDay: 'DD. MMM',
    yearMonth: 'MMMM YYYY'
  },
  
  // View Mode
  viewMode: {
    quarter: 'Quartal',
    month: 'Monat',
    week: 'Woche',
    day: 'Tag',
    hour: 'Stunde',
    daySubMode: 'Tag-Untermodus',
    fullDay: 'Ganzer Tag',
    halfDay: 'Halber Tag',
    '15min': '15 Minuten',
    '30min': '30 Minuten'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: 'Quartale',
    months: 'Monate',
    weeks: 'Wochen',
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    hoursAndMinutes: '{hours}Std {minutes}Min'
  },
  
  // Task
  task: {
    addRoot: 'Hauptaufgabe hinzufügen',
    addSub: 'Unteraufgabe hinzufügen',
    remove: 'Aufgabe löschen',
    edit: 'Aufgabe bearbeiten',
    name: 'Aufgabenname',
    priority: 'Priorität',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    duration: 'Dauer',
    progress: 'Fortschritt',
    serialNumber: 'Nr.',
    type: 'Typ',
    taskType: 'Aufgabe',
    projectType: 'Projekt',
    milestoneType: 'Meilenstein'
  },
  
  // Link Legend
  link: {
    legend: 'Verknüpfungslegende',
    parentChild: 'Übergeordnet-Untergeordnet',
    finishToStart: 'Ende-Anfang',
    startToStart: 'Anfang-Anfang',
    finishToFinish: 'Ende-Ende',
    startToFinish: 'Anfang-Ende',
    fs: 'EA',
    ss: 'AA',
    ff: 'EE',
    sf: 'AE',
    pc: 'ÜU'
  },
  
  // Config Panel
  configPanel: {
    title: 'Gantt-Konfiguration',
    themeSettings: 'Themeneinstellungen',
    linkSettings: 'Verknüpfungseinstellungen',
    languageSettings: 'Spracheinstellungen',
    currentTheme: 'Aktuell',
    previewTheme: 'Vorschau',
    exportConfig: 'Konfiguration exportieren',
    importConfig: 'Konfiguration importieren',
    
    // Link Configuration
    linkConfig: {
      info: 'Aufgabenabhängigkeitsverknüpfungen konfigurieren (Ende-Anfang, Anfang-Anfang usw.)',
      pathType: 'Pfadtyp',
      straight: 'Gerade',
      bezier: 'Bézier',
      rightAngle: 'Rechter Winkel',
      color: 'Farbe',
      width: 'Linienstärke',
      dashStyle: 'Strichstil',
      solid: 'Durchgezogen',
      shortDash: 'Kurzer Strich',
      mediumDash: 'Mittlerer Strich',
      longDash: 'Langer Strich',
      dotDash: 'Punkt-Strich',
      curvature: 'Krümmung',
      offset: 'Versatzabstand',
      smoothCorners: 'Glatte Ecken',
      cornerRadius: 'Eckenradius',
      showArrow: 'Pfeil anzeigen',
      arrowSize: 'Pfeilgröße',
      arrowColor: 'Pfeilfarbe',
      syncColor: 'Synchronisieren',
      dashAnimation: 'Strich-Animation',
      animationSpeed: 'Animationsgeschwindigkeit',
      showLabels: 'Beschriftungen anzeigen',
      labelColor: 'Beschriftungsfarbe',
      fontSize: 'Schriftgröße',
      typeColors: 'Abhängigkeitstypfarben',
      parentChildStyle: 'Übergeordnet-Untergeordnet-Verknüpfungsstil',
      parentChildInfo: 'Hierarchische Beziehung zwischen übergeordneten und untergeordneten Aufgaben anzeigen'
    }
  },
  
  // Theme
  theme: {
    metro: 'Metro',
    light: 'Hell',
    dark: 'Dunkel',
    colorful: 'Farbenfroh',
    ocean: 'Ozean',
    apple: 'Apple',
    classic: 'Klassisch',
    liquidGlass: 'Flüssigglas',
    metroDesc: 'Klassischer Windows Metro-Stil',
    lightDesc: 'Frischer und heller Stil',
    darkDesc: 'Eleganter und professioneller dunkler Stil',
    colorfulDesc: 'Lebendiger farbenfroher Stil',
    oceanDesc: 'Ruhiger und komfortabler Ozean-Stil',
    appleDesc: 'Minimalistischer und eleganter macOS-Stil',
    classicDesc: 'Traditioneller und stabiler Geschäftsstil',
    liquidGlassDesc: 'iOS 26 Flüssigglas-Effekt mit durchscheinender Fließfähigkeit'
  },
  
  // Date Picker
  datePicker: {
    selectDate: 'Datum auswählen',
    clearDate: 'Datum löschen'
  },
  
  // Column Settings
  columnSettings: {
    title: 'Spalteneinstellungen',
    desc: 'Anzuzeigende Spalten auswählen',
    showAll: 'Alle anzeigen',
    hideAll: 'Alle ausblenden',
    reset: 'Standard wiederherstellen'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: 'Unteraufgabe hinzufügen',
    removeTask: 'Aktuelle Aufgabe löschen',
    syncArrowColor: 'Mit Linienfarbe synchronisieren',
    close: 'Schließen',
    columnSettings: 'Spalteneinstellungen'
  }
};
