/**
 * Russian language pack
 * Русский языковой пакет
 */
export default {
  // Common
  common: {
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    close: 'Закрыть',
    export: 'Экспорт',
    import: 'Импорт',
    config: 'Конфигурация',
    settings: 'Настройки',
    theme: 'Тема',
    to: 'до',
    selectDate: 'Выбрать дату'
  },
  
  // Date & Time
  date: {
    year: 'Год',
    month: 'Месяц',
    day: 'День',
    hour: 'Час',
    week: 'Неделя',
    today: 'Сегодня',
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Вс',
    january: 'Январь',
    february: 'Февраль',
    march: 'Март',
    april: 'Апрель',
    may: 'Май',
    june: 'Июнь',
    july: 'Июль',
    august: 'Август',
    september: 'Сентябрь',
    october: 'Октябрь',
    november: 'Ноябрь',
    december: 'Декабрь'
  },
  
  // Date Format
  dateFormat: {
    full: 'DD MMMM YYYY г.',
    short: 'DD.MM.YYYY',
    monthDay: 'DD MMM',
    yearMonth: 'MMMM YYYY'
  },
  
  // View Mode
  viewMode: {
    quarter: 'Квартал',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    hour: 'Час',
    daySubMode: 'Подрежим дня',
    fullDay: 'Полный день',
    halfDay: 'Полдня',
    '15min': '15 минут',
    '30min': '30 минут'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: 'кварталов',
    months: 'месяцев',
    weeks: 'недель',
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    hoursAndMinutes: '{hours}ч {minutes}мин'
  },
  
  // Task
  task: {
    addRoot: 'Добавить корневую задачу',
    addSub: 'Добавить подзадачу',
    remove: 'Удалить задачу',
    edit: 'Редактировать задачу',
    name: 'Название задачи',
    priority: 'Приоритет',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    duration: 'Длительность',
    progress: 'Прогресс',
    serialNumber: '№',
    type: 'Тип',
    taskType: 'Задача',
    projectType: 'Проект',
    milestoneType: 'Веха'
  },
  
  // Link Legend
  link: {
    legend: 'Легенда связей',
    parentChild: 'Родитель-Потомок',
    finishToStart: 'Окончание-Начало',
    startToStart: 'Начало-Начало',
    finishToFinish: 'Окончание-Окончание',
    startToFinish: 'Начало-Окончание',
    fs: 'ОН',
    ss: 'НН',
    ff: 'ОО',
    sf: 'НО',
    pc: 'РП'
  },
  
  // Config Panel
  configPanel: {
    title: 'Конфигурация Gantt',
    themeSettings: 'Настройки темы',
    linkSettings: 'Настройки связей',
    languageSettings: 'Настройки языка',
    currentTheme: 'Текущая',
    previewTheme: 'Предпросмотр',
    exportConfig: 'Экспорт конфигурации',
    importConfig: 'Импорт конфигурации',
    
    // Link Configuration
    linkConfig: {
      info: 'Настройка связей зависимостей задач (Окончание-Начало, Начало-Начало и т.д.)',
      pathType: 'Тип пути',
      straight: 'Прямая',
      bezier: 'Безье',
      rightAngle: 'Прямой угол',
      color: 'Цвет',
      width: 'Толщина линии',
      dashStyle: 'Стиль пунктира',
      solid: 'Сплошная',
      shortDash: 'Короткий пунктир',
      mediumDash: 'Средний пунктир',
      longDash: 'Длинный пунктир',
      dotDash: 'Точка-тире',
      curvature: 'Кривизна',
      offset: 'Расстояние смещения',
      smoothCorners: 'Сглаженные углы',
      cornerRadius: 'Радиус угла',
      showArrow: 'Показать стрелку',
      arrowSize: 'Размер стрелки',
      arrowColor: 'Цвет стрелки',
      syncColor: 'Синхронизировать',
      dashAnimation: 'Анимация пунктира',
      animationSpeed: 'Скорость анимации',
      showLabels: 'Показать метки',
      labelColor: 'Цвет метки',
      fontSize: 'Размер шрифта',
      typeColors: 'Цвета типов зависимостей',
      parentChildStyle: 'Стиль связи родитель-потомок',
      parentChildInfo: 'Показать иерархическую связь между родительскими и дочерними задачами'
    }
  },
  
  // Theme
  theme: {
    metro: 'Метро',
    light: 'Светлая',
    dark: 'Темная',
    colorful: 'Красочная',
    ocean: 'Океан',
    apple: 'Apple',
    classic: 'Классический',
    liquidGlass: 'Жидкое стекло',
    metroDesc: 'Классический стиль Windows Metro',
    lightDesc: 'Свежий и яркий светлый стиль',
    darkDesc: 'Элегантный и профессиональный темный стиль',
    colorfulDesc: 'Яркий красочный стиль',
    oceanDesc: 'Спокойный и комфортный океанский стиль',
    appleDesc: 'Минималистичный и элегантный стиль macOS',
    classicDesc: 'Традиционный и стабильный деловой стиль',
    liquidGlassDesc: 'Эффект жидкого стекла iOS 26 с полупрозрачной текучестью'
  },
  
  // Date Picker
  datePicker: {
    selectDate: 'Выбрать дату',
    clearDate: 'Очистить дату'
  },
  
  // Column Settings
  columnSettings: {
    title: 'Настройки столбцов',
    desc: 'Выберите столбцы для отображения',
    showAll: 'Показать все',
    hideAll: 'Скрыть все',
    reset: 'Восстановить по умолчанию'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: 'Добавить подзадачу',
    removeTask: 'Удалить текущую задачу',
    syncArrowColor: 'Синхронизировать с цветом линии',
    close: 'Закрыть',
    columnSettings: 'Настройки столбцов'
  }
};
