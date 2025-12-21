/**
 * 繁體中文語言包
 * Traditional Chinese (Taiwan) Language Pack
 */
export default {
  // 通用
  common: {
    confirm: '確定',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    add: '新增',
    close: '關閉',
    export: '匯出',
    import: '匯入',
    config: '配置',
    settings: '設定',
    theme: '主題',
    to: '至',
    selectDate: '請選擇日期'
  },
  
  // 日期時間
  date: {
    year: '年',
    month: '月',
    day: '日',
    hour: '時',
    week: '週',
    today: '今天',
    monday: '一',
    tuesday: '二',
    wednesday: '三',
    thursday: '四',
    friday: '五',
    saturday: '六',
    sunday: '日',
    january: '一月',
    february: '二月',
    march: '三月',
    april: '四月',
    may: '五月',
    june: '六月',
    july: '七月',
    august: '八月',
    september: '九月',
    october: '十月',
    november: '十一月',
    december: '十二月'
  },
  
  // 日期格式
  dateFormat: {
    full: 'YYYY年MM月DD日',
    short: 'YYYY-MM-DD',
    monthDay: 'MM月DD日',
    yearMonth: 'YYYY年MM月'
  },
  
  // 視圖模式
  viewMode: {
    quarter: '季度',
    month: '月',
    week: '週',
    day: '日',
    hour: '時',
    daySubMode: '日模式細分',
    fullDay: '全天',
    halfDay: '半天',
    '15min': '15分鐘',
    '30min': '30分鐘'
  },
  
  // 耗時單位
  durationUnit: {
    quarters: '季度',
    months: '月',
    weeks: '週',
    days: '天',
    hours: '小時',
    minutes: '分鐘',
    hoursAndMinutes: '{hours}小時{minutes}分鐘'
  },
  
  // 任務
  task: {
    addRoot: '新增根任務',
    addSub: '新增子任務',
    remove: '刪除任務',
    edit: '編輯任務',
    name: '任務名稱',
    priority: '優先級',
    startDate: '開始時間',
    endDate: '結束時間',
    duration: '耗時',
    progress: '進度',
    serialNumber: '序號',
    type: '類型',
    taskType: '任務',
    projectType: '專案',
    milestoneType: '里程碑'
  },
  
  // 連線圖例
  link: {
    legend: '連線圖例',
    parentChild: '父子關係',
    finishToStart: '完成-開始',
    startToStart: '開始-開始',
    finishToFinish: '完成-完成',
    startToFinish: '開始-完成',
    fs: 'FS',
    ss: 'SS',
    ff: 'FF',
    sf: 'SF',
    pc: 'PC'
  },
  
  // 配置面板
  configPanel: {
    title: '甘特圖配置',
    themeSettings: '主題設定',
    linkSettings: '連線設定',
    languageSettings: '語言設定',
    currentTheme: '當前',
    previewTheme: '預覽',
    exportConfig: '匯出配置',
    importConfig: '匯入配置',
    
    // 連線配置
    linkConfig: {
      info: '以下配置用於任務依賴連線（完成-開始、開始-開始等關係）',
      pathType: '路徑類型',
      straight: '直線',
      bezier: '貝茲曲線',
      rightAngle: '直角',
      color: '顏色',
      width: '線寬',
      dashStyle: '虛線樣式',
      solid: '實線',
      shortDash: '短虛線',
      mediumDash: '中虛線',
      longDash: '長虛線',
      dotDash: '點劃線',
      curvature: '彎曲度',
      offset: '偏移距離',
      smoothCorners: '平滑轉角',
      cornerRadius: '轉角半徑',
      showArrow: '顯示箭頭',
      arrowSize: '箭頭大小',
      arrowColor: '箭頭顏色',
      syncColor: '同步',
      dashAnimation: '虛線流動動畫',
      animationSpeed: '動畫速度',
      showLabels: '顯示標籤',
      labelColor: '標籤顏色',
      fontSize: '字體大小',
      typeColors: '依賴類型顏色',
      parentChildStyle: '父子關係連線樣式',
      parentChildInfo: '用於顯示父任務與子任務之間的層級結構關係'
    }
  },
  
  // 主題
  theme: {
    metro: 'Metro 金屬質感',
    light: '淺色主題',
    dark: '深色主題',
    colorful: '多彩主題',
    ocean: '海洋主題',
    apple: 'Apple 蘋果風格',
    classic: '經典商務',
    liquidGlass: 'Liquid Glass 液態玻璃',
    metroDesc: '經典 Windows Metro 風格',
    lightDesc: '清爽明亮的淺色風格',
    darkDesc: '優雅專業的深色風格',
    colorfulDesc: '活力四射的多彩風格',
    oceanDesc: '沉靜舒適的海洋風格',
    appleDesc: '簡約優雅的 macOS 風格',
    classicDesc: '傳統穩重的商務風格',
    liquidGlassDesc: 'iOS 26 液態玻璃效果，半透明流動質感'
  },
  
  // 日期選擇器
  datePicker: {
    selectDate: '請選擇日期',
    clearDate: '清除日期'
  },
  
  // 列設定
  columnSettings: {
    title: '列顯示設定',
    desc: '勾選要顯示的列',
    showAll: '全部顯示',
    hideAll: '全部隱藏',
    reset: '恢復預設'
  },
  
  // 提示資訊
  tooltip: {
    addSubTask: '新增子任務',
    removeTask: '刪除當前任務',
    syncArrowColor: '與線條顏色同步',
    close: '關閉',
    columnSettings: '列顯示設定'
  }
};
