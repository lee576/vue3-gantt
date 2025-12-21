/**
 * Korean language pack
 * 한국어 언어 팩
 */
export default {
  // Common
  common: {
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    close: '닫기',
    export: '내보내기',
    import: '가져오기',
    config: '설정',
    settings: '설정',
    theme: '테마',
    to: '에서',
    selectDate: '날짜 선택'
  },
  
  // Date & Time
  date: {
    year: '년',
    month: '월',
    day: '일',
    hour: '시',
    week: '주',
    today: '오늘',
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일',
    january: '1월',
    february: '2월',
    march: '3월',
    april: '4월',
    may: '5월',
    june: '6월',
    july: '7월',
    august: '8월',
    september: '9월',
    october: '10월',
    november: '11월',
    december: '12월'
  },
  
  // Date Format
  dateFormat: {
    full: 'YYYY년 MM월 DD일',
    short: 'YYYY-MM-DD',
    monthDay: 'MM월 DD일',
    yearMonth: 'YYYY년 MM월'
  },
  
  // View Mode
  viewMode: {
    quarter: '분기',
    month: '월',
    week: '주',
    day: '일',
    hour: '시',
    daySubMode: '일 하위 모드',
    fullDay: '하루 종일',
    halfDay: '반나절',
    '15min': '15분',
    '30min': '30분'
  },
  
  // Duration Unit
  durationUnit: {
    quarters: '분기',
    months: '개월',
    weeks: '주',
    days: '일',
    hours: '시간',
    minutes: '분',
    hoursAndMinutes: '{hours}시간 {minutes}분'
  },
  
  // Task
  task: {
    addRoot: '루트 작업 추가',
    addSub: '하위 작업 추가',
    remove: '작업 삭제',
    edit: '작업 편집',
    name: '작업 이름',
    priority: '우선순위',
    startDate: '시작일',
    endDate: '종료일',
    duration: '기간',
    progress: '진행률',
    serialNumber: '번호',
    type: '유형',
    taskType: '작업',
    projectType: '프로젝트',
    milestoneType: '마일스톤'
  },
  
  // Link Legend
  link: {
    legend: '링크 범례',
    parentChild: '부모-자식',
    finishToStart: '종료-시작',
    startToStart: '시작-시작',
    finishToFinish: '종료-종료',
    startToFinish: '시작-종료',
    fs: 'FS',
    ss: 'SS',
    ff: 'FF',
    sf: 'SF',
    pc: 'PC'
  },
  
  // Config Panel
  configPanel: {
    title: '간트 차트 설정',
    themeSettings: '테마 설정',
    linkSettings: '링크 설정',
    languageSettings: '언어 설정',
    currentTheme: '현재',
    previewTheme: '미리보기',
    exportConfig: '설정 내보내기',
    importConfig: '설정 가져오기',
    
    // Link Configuration
    linkConfig: {
      info: '작업 종속성 링크 설정 (종료-시작, 시작-시작 등)',
      pathType: '경로 유형',
      straight: '직선',
      bezier: '베지어 곡선',
      rightAngle: '직각',
      color: '색상',
      width: '선 두께',
      dashStyle: '파선 스타일',
      solid: '실선',
      shortDash: '짧은 파선',
      mediumDash: '중간 파선',
      longDash: '긴 파선',
      dotDash: '점선 파선',
      curvature: '곡률',
      offset: '오프셋 거리',
      smoothCorners: '부드러운 모서리',
      cornerRadius: '모서리 반경',
      showArrow: '화살표 표시',
      arrowSize: '화살표 크기',
      arrowColor: '화살표 색상',
      syncColor: '동기화',
      dashAnimation: '파선 애니메이션',
      animationSpeed: '애니메이션 속도',
      showLabels: '레이블 표시',
      labelColor: '레이블 색상',
      fontSize: '글꼴 크기',
      typeColors: '종속성 유형 색상',
      parentChildStyle: '부모-자식 링크 스타일',
      parentChildInfo: '부모 작업과 자식 작업의 계층 관계 표시'
    }
  },
  
  // Theme
  theme: {
    metro: '메트로',
    light: '라이트',
    dark: '다크',
    colorful: '컬러풀',
    ocean: '오션',
    apple: 'Apple',
    classic: '클래식',
    liquidGlass: '리퀴드 글래스',
    metroDesc: '클래식 Windows 메트로 스타일',
    lightDesc: '밝고 상쾌한 라이트 스타일',
    darkDesc: '우아하고 전문적인 다크 스타일',
    colorfulDesc: '활기찬 컬러풀 스타일',
    oceanDesc: '차분하고 편안한 오션 스타일',
    appleDesc: '미니멀하고 우아한 macOS 스타일',
    classicDesc: '전통적이고 안정적인 비즈니스 스타일',
    liquidGlassDesc: 'iOS 26 반투명 유동성을 지닌 리퀴드 글래스 효과'
  },
  
  // Date Picker
  datePicker: {
    selectDate: '날짜 선택',
    clearDate: '날짜 지우기'
  },
  
  // Column Settings
  columnSettings: {
    title: '열 표시 설정',
    desc: '표시할 열 선택',
    showAll: '모두 표시',
    hideAll: '모두 숨기기',
    reset: '기본값 복원'
  },
  
  // Tooltip
  tooltip: {
    addSubTask: '하위 작업 추가',
    removeTask: '현재 작업 삭제',
    syncArrowColor: '선 색상과 동기화',
    close: '닫기',
    columnSettings: '열 표시 설정'
  }
};
