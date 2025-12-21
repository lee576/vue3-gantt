/**
 * 简体中文语言包
 */
export default {
  // 通用
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    close: '关闭',
    export: '导出',
    import: '导入',
    config: '配置',
    settings: '设置',
    theme: '主题',
    to: '至',
    selectDate: '请选择日期'
  },
  
  // 日期时间
  date: {
    year: '年',
    month: '月',
    day: '日',
    hour: '时',
    week: '周',
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
  
  // 视图模式
  viewMode: {
    quarter: '季度',
    month: '月',
    week: '周',
    day: '日',
    hour: '时',
    daySubMode: '日模式细分',
    fullDay: '全天',
    halfDay: '半天',
    '15min': '15分钟',
    '30min': '30分钟'
  },
  
  // 耗时单位
  durationUnit: {
    quarters: '季度',
    months: '月',
    weeks: '周',
    days: '天',
    hours: '小时',
    minutes: '分钟',
    hoursAndMinutes: '{hours}小时{minutes}分钟'
  },
  
  // 任务
  task: {
    addRoot: '添加根任务',
    addSub: '添加子任务',
    remove: '删除任务',
    edit: '编辑任务',
    name: '任务名称',
    priority: '优先级',
    startDate: '开始时间',
    endDate: '结束时间',
    duration: '耗时',
    progress: '进度',
    serialNumber: '序号',
    type: '类型',
    taskType: '任务',
    projectType: '项目',
    milestoneType: '里程碑'
  },
  
  // 连线图例
  link: {
    legend: '连线图例',
    parentChild: '父子关系',
    finishToStart: '完成-开始',
    startToStart: '开始-开始',
    finishToFinish: '完成-完成',
    startToFinish: '开始-完成',
    fs: 'FS',
    ss: 'SS',
    ff: 'FF',
    sf: 'SF',
    pc: 'PC'
  },
  
  // 配置面板
  configPanel: {
    title: '甘特图配置',
    themeSettings: '主题设置',
    linkSettings: '连线设置',
    languageSettings: '语言设置',
    currentTheme: '当前',
    previewTheme: '预览',
    exportConfig: '导出配置',
    importConfig: '导入配置',
    
    // 连线配置
    linkConfig: {
      info: '以下配置用于任务依赖连线（完成-开始、开始-开始等关系）',
      pathType: '路径类型',
      straight: '直线',
      bezier: '贝塞尔',
      rightAngle: '直角',
      color: '颜色',
      width: '线宽',
      dashStyle: '虚线样式',
      solid: '实线',
      shortDash: '短虚线',
      mediumDash: '中虚线',
      longDash: '长虚线',
      dotDash: '点划线',
      curvature: '弯曲度',
      offset: '偏移距离',
      smoothCorners: '平滑转角',
      cornerRadius: '转角半径',
      showArrow: '显示箭头',
      arrowSize: '箭头大小',
      arrowColor: '箭头颜色',
      syncColor: '同步',
      dashAnimation: '虚线流动动画',
      animationSpeed: '动画速度',
      showLabels: '显示标签',
      labelColor: '标签颜色',
      fontSize: '字体大小',
      typeColors: '依赖类型颜色',
      parentChildStyle: '父子关系连线样式',
      parentChildInfo: '用于显示父任务与子任务之间的层级结构关系'
    }
  },
  
  // 主题
  theme: {
    metro: 'Metro 金属质感',
    light: '浅色主题',
    dark: '深色主题',
    colorful: '多彩主题',
    ocean: '海洋主题',
    apple: 'Apple 苹果风格',
    classic: '经典商务',
    liquidGlass: 'Liquid Glass 液态玻璃',
    metroDesc: '经典 Windows Metro 风格',
    lightDesc: '清爽明亮的浅色风格',
    darkDesc: '优雅专业的深色风格',
    colorfulDesc: '活力四射的多彩风格',
    oceanDesc: '沉静舒适的海洋风格',
    appleDesc: '简约优雅的 macOS 风格',
    classicDesc: '传统稳重的商务风格',
    liquidGlassDesc: 'iOS 26 液态玻璃效果，半透明流动质感'
  },
  
  // 日期选择器
  datePicker: {
    selectDate: '请选择日期',
    clearDate: '清除日期'
  },
  
  // 列设置
  columnSettings: {
    title: '列显示设置',
    desc: '勾选要显示的列',
    showAll: '全部显示',
    hideAll: '全部隐藏',
    reset: '恢复默认'
  },
  
  // 提示信息
  tooltip: {
    addSubTask: '添加子任务',
    removeTask: '删除当前任务',
    syncArrowColor: '与线条颜色同步',
    close: '关闭',
    columnSettings: '列显示设置'
  }
};
