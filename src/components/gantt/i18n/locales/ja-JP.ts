/**
 * Japanese language pack
 * 日本語言語パック
 */
export default {
  // Common
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    close: '閉じる',
    export: 'エクスポート',
    import: 'インポート',
    config: '設定',
    settings: '設定',
    theme: 'テーマ',
    to: 'から',
    selectDate: '日付を選択'
  },
  
  // Date & Time
  date: {
    year: '年',
    month: '月',
    day: '日',
    hour: '時',
    week: '週',
    today: '今日',
    monday: '月',
    tuesday: '火',
    wednesday: '水',
    thursday: '木',
    friday: '金',
    saturday: '土',
    sunday: '日',
    january: '1月',
    february: '2月',
    march: '3月',
    april: '4月',
    may: '5月',
    june: '6月',
    july: '7月',
    august: '8月',
    september: '9月',
    october: '10月',
    november: '11月',
    december: '12月'
  },
  
  // Date Format
  dateFormat: {
    full: 'YYYY年MM月DD日',
    short: 'YYYY/MM/DD',
    monthDay: 'MM月DD日',
    yearMonth: 'YYYY年MM月'
  },
  
  // View Mode
  viewMode: {
    quarter: '四半期',
    month: '月',
    week: '週',
    day: '日',
    hour: '時',
    daySubMode: '日モードサブ',
    fullDay: '終日',
    halfDay: '半日',
    '15min': '15分',
    '30min': '30分'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: '四半期',
    months: 'ヶ月',
    weeks: '週間',
    days: '日',
    hours: '時間',
    minutes: '分',
    hoursAndMinutes: '{hours}時間{minutes}分'
  },
  
  // Task
  task: {
    addRoot: 'ルートタスクを追加',
    addSub: 'サブタスクを追加',
    remove: 'タスクを削除',
    edit: 'タスクを編集',
    name: 'タスク名',
    priority: '優先度',
    startDate: '開始日',
    endDate: '終了日',
    duration: '期間',
    progress: '進捗',
    serialNumber: '番号',
    type: 'タイプ',
    taskType: 'タスク',
    projectType: 'プロジェクト',
    milestoneType: 'マイルストーン'
  },
  
  // Link Legend
  link: {
    legend: 'リンク凡例',
    parentChild: '親子関係',
    finishToStart: '終了-開始',
    startToStart: '開始-開始',
    finishToFinish: '終了-終了',
    startToFinish: '開始-終了',
    fs: 'FS',
    ss: 'SS',
    ff: 'FF',
    sf: 'SF',
    pc: 'PC'
  },
  
  // Config Panel
  configPanel: {
    title: 'ガントチャート設定',
    themeSettings: 'テーマ設定',
    linkSettings: 'リンク設定',
    languageSettings: '言語設定',
    currentTheme: '現在',
    previewTheme: 'プレビュー',
    exportConfig: '設定をエクスポート',
    importConfig: '設定をインポート',
    
    // Link Configuration
    linkConfig: {
      info: 'タスク依存関係リンク（終了-開始、開始-開始など）を設定',
      pathType: 'パスタイプ',
      straight: '直線',
      bezier: 'ベジェ曲線',
      rightAngle: '直角',
      color: '色',
      width: '線の太さ',
      dashStyle: '破線スタイル',
      solid: '実線',
      shortDash: '短い破線',
      mediumDash: '中破線',
      longDash: '長い破線',
      dotDash: '点線破線',
      curvature: '曲率',
      offset: 'オフセット距離',
      smoothCorners: '滑らかな角',
      cornerRadius: '角の半径',
      showArrow: '矢印を表示',
      arrowSize: '矢印サイズ',
      arrowColor: '矢印の色',
      syncColor: '同期',
      dashAnimation: '破線アニメーション',
      animationSpeed: 'アニメーション速度',
      showLabels: 'ラベルを表示',
      labelColor: 'ラベルの色',
      fontSize: 'フォントサイズ',
      typeColors: '依存関係タイプの色',
      parentChildStyle: '親子リンクスタイル',
      parentChildInfo: '親タスクと子タスクの階層関係を表示'
    }
  },
  
  // Theme
  theme: {
    metro: 'メトロ',
    light: 'ライト',
    dark: 'ダーク',
    colorful: 'カラフル',
    ocean: 'オーシャン',
    apple: 'Apple',
    classic: 'クラシック',
    liquidGlass: 'リキッドグラス',
    metroDesc: 'クラシックWindowsメトロスタイル',
    lightDesc: '明るく爽やかなライトスタイル',
    darkDesc: 'エレガントでプロフェッショナルなダークスタイル',
    colorfulDesc: '活気あるカラフルスタイル',
    oceanDesc: '落ち着いた快適なオーシャンスタイル',
    appleDesc: 'ミニマルでエレガントなmacOSスタイル',
    classicDesc: '伝統的で安定感のあるビジネススタイル',
    liquidGlassDesc: 'iOS 26 リキッドグラス効果、半透明で流動的な質感'
  },
  
  // Date Picker
  datePicker: {
    selectDate: '日付を選択',
    clearDate: '日付をクリア'
  },
  
  // Column Settings
  columnSettings: {
    title: '列表示設定',
    desc: '表示する列を選択',
    showAll: 'すべて表示',
    hideAll: 'すべて非表示',
    reset: 'デフォルトに戻す'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: 'サブタスクを追加',
    removeTask: '現在のタスクを削除',
    syncArrowColor: '線の色と同期',
    close: '閉じる',
    columnSettings: '列表示設定'
  }
};
