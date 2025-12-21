/**
 * Spanish language pack
 * Paquete de idioma español
 */
export default {
  // Common
  common: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    close: 'Cerrar',
    export: 'Exportar',
    import: 'Importar',
    config: 'Configuración',
    settings: 'Ajustes',
    theme: 'Tema',
    to: 'a',
    selectDate: 'Seleccionar fecha'
  },
  
  // Date & Time
  date: {
    year: 'Año',
    month: 'Mes',
    day: 'Día',
    hour: 'Hora',
    week: 'Semana',
    today: 'Hoy',
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb',
    sunday: 'Dom',
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre'
  },
  
  // Date Format
  dateFormat: {
    full: 'DD [de] MMMM [de] YYYY',
    short: 'DD/MM/YYYY',
    monthDay: 'DD MMM',
    yearMonth: 'MMMM YYYY'
  },
  
  // View Mode
  viewMode: {
    quarter: 'Trimestre',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    hour: 'Hora',
    daySubMode: 'Submodo de día',
    fullDay: 'Día completo',
    halfDay: 'Medio día',
    '15min': '15 minutos',
    '30min': '30 minutos'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: 'trimestres',
    months: 'meses',
    weeks: 'semanas',
    days: 'días',
    hours: 'horas',
    minutes: 'minutos',
    hoursAndMinutes: '{hours}h {minutes}min'
  },
  
  // Task
  task: {
    addRoot: 'Agregar tarea raíz',
    addSub: 'Agregar subtarea',
    remove: 'Eliminar tarea',
    edit: 'Editar tarea',
    name: 'Nombre de tarea',
    priority: 'Prioridad',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    duration: 'Duración',
    progress: 'Progreso',
    serialNumber: 'Nº',
    type: 'Tipo',
    taskType: 'Tarea',
    projectType: 'Proyecto',
    milestoneType: 'Hito'
  },
  
  // Link Legend
  link: {
    legend: 'Leyenda de enlaces',
    parentChild: 'Padre-Hijo',
    finishToStart: 'Fin-Inicio',
    startToStart: 'Inicio-Inicio',
    finishToFinish: 'Fin-Fin',
    startToFinish: 'Inicio-Fin',
    fs: 'FI',
    ss: 'II',
    ff: 'FF',
    sf: 'IF',
    pc: 'PH'
  },
  
  // Config Panel
  configPanel: {
    title: 'Configuración Gantt',
    themeSettings: 'Configuración de tema',
    linkSettings: 'Configuración de enlaces',
    languageSettings: 'Configuración de idioma',
    currentTheme: 'Actual',
    previewTheme: 'Vista previa',
    exportConfig: 'Exportar configuración',
    importConfig: 'Importar configuración',
    
    // Link Configuration
    linkConfig: {
      info: 'Configurar enlaces de dependencia de tareas (Fin-Inicio, Inicio-Inicio, etc.)',
      pathType: 'Tipo de ruta',
      straight: 'Recta',
      bezier: 'Bézier',
      rightAngle: 'Ángulo recto',
      color: 'Color',
      width: 'Grosor de línea',
      dashStyle: 'Estilo de guión',
      solid: 'Sólido',
      shortDash: 'Guión corto',
      mediumDash: 'Guión medio',
      longDash: 'Guión largo',
      dotDash: 'Punto-guión',
      curvature: 'Curvatura',
      offset: 'Distancia de desplazamiento',
      smoothCorners: 'Esquinas suaves',
      cornerRadius: 'Radio de esquina',
      showArrow: 'Mostrar flecha',
      arrowSize: 'Tamaño de flecha',
      arrowColor: 'Color de flecha',
      syncColor: 'Sincronizar',
      dashAnimation: 'Animación de guión',
      animationSpeed: 'Velocidad de animación',
      showLabels: 'Mostrar etiquetas',
      labelColor: 'Color de etiqueta',
      fontSize: 'Tamaño de fuente',
      typeColors: 'Colores de tipo de dependencia',
      parentChildStyle: 'Estilo de enlace padre-hijo',
      parentChildInfo: 'Mostrar relación jerárquica entre tareas padre e hijo'
    }
  },
  
  // Theme
  theme: {
    metro: 'Metro',
    light: 'Claro',
    dark: 'Oscuro',
    colorful: 'Colorido',
    ocean: 'Océano',
    apple: 'Apple',
    classic: 'Clásico',
    liquidGlass: 'Cristal Líquido',
    metroDesc: 'Estilo Metro Windows clásico',
    lightDesc: 'Estilo claro fresco y brillante',
    darkDesc: 'Estilo oscuro elegante y profesional',
    colorfulDesc: 'Estilo colorido vibrante',
    oceanDesc: 'Estilo océano tranquilo y cómodo',
    appleDesc: 'Estilo macOS minimalista y elegante',
    classicDesc: 'Estilo empresarial tradicional y estable',
    liquidGlassDesc: 'Efecto de Cristal Líquido iOS 26 con fluidez translúcida'
  },
  
  // Date Picker
  datePicker: {
    selectDate: 'Seleccionar fecha',
    clearDate: 'Borrar fecha'
  },
  
  // Column Settings
  columnSettings: {
    title: 'Configuración de columnas',
    desc: 'Seleccionar columnas a mostrar',
    showAll: 'Mostrar todo',
    hideAll: 'Ocultar todo',
    reset: 'Restablecer predeterminado'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: 'Agregar subtarea',
    removeTask: 'Eliminar tarea actual',
    syncArrowColor: 'Sincronizar con color de línea',
    close: 'Cerrar',
    columnSettings: 'Configuración de columnas'
  }
};
