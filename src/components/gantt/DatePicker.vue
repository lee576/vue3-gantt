<template>
  <div>
    <!-- 添加文本框 -->
    <div class="date-picker-input-wrapper">
      <input type="text" v-model="selectedDateText" @click="openCalendar" readonly :placeholder="t('datePicker.selectDate')"
        class="date-picker-input" ref="inputRef" />
      <span class="clear-date-button" @click="clearDate" v-if="selectedDateText">
        <svg viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
          </path>
        </svg>
      </span>
    </div>
    <!-- 日期选择器 - 使用 Teleport 传送到 body 避免被父容器 overflow:hidden 裁剪 -->
    <Teleport to="body">
      <div class="e-calendar" v-show="showCalendar" ref="calendarRef" :style="calendarPosition">
      <div class="e-date-select">
        <div class="e-date-year">
          <transition name="fadeY">
            <div :key="selectDate.year" class="e-date-year-select" @click="openYearList" :class="{ active: showYear }">
              {{ selectDate.year }}
            </div>
          </transition>
        </div>
        <div class="e-date-monthday">
          <transition name="fadeY">
            <div :key="selectDate.day" class="e-date-monthday-select" :class="{ active: !showYear }"
              @click="openCalendarList">
              <span>{{ keepDoubleDigit(selectDate.month) }}-{{ keepDoubleDigit(selectDate.day) }}</span>&nbsp;
              <span style="cursor: pointer;" @click="openMonthList">{{ showDate.monthStr }}</span>
            </div>
          </transition>
        </div>
      </div>

      <div class="e-calendar-container" v-show="!showYear && !showMonth">
        <div class="e-calendar-toolbar">
          <div class="e-calendar-svg" @click="prevMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="prevMonthClick"></div>
            </transition>
          </div>
          <div class="e-calendar-toolbar-title">
            <transition :name="fadeXType">
              <div :key="showDate.monthStr" class="e-calendar-toolbar-title-content">
                <strong>{{ showDate.year }}</strong>&nbsp;
                <span style="cursor: pointer;" @click="openMonthList">{{ showDate.monthStr }}</span>
              </div>
            </transition>
          </div>
          <div class="e-calendar-svg" @click="nextMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="nextMonthClick"></div>
            </transition>
          </div>
        </div>
        <div class="e-calendar-week">
          <span v-for="(weekName, index) in getWeekNames" :key="index" class="e-calendar-week-day">{{ weekName }}</span>
        </div>
        <div class="e-calendar-monthday">
          <transition :name="fadeXType">
            <div :key="showDate.monthStr" class="e-calendar-monthday-wrapper">
              <div v-for="(row, index) in rows" :key="index" class="e-calendar-monthday-row">
                <span v-for="(day, dayIndex) in row" :key="dayIndex" class="e-calendar-monthday-row-day"
                  @click="selectDay(day)" @mouseenter="handleDayMouseEnter(dayIndex, index)"
                  @mouseleave="handleDayMouseLeave()" :class="{
        active: day.selected,
        disabled: day.disabled,
        pointer: day.value !== '',
        hover: isDayHovered(dayIndex, index)
      }">
                  <span v-text="day.value" class="e-calendar-monthday-row-day-value"></span>
                  <transition name="e_calendar_day">
                    <span class="e-calendar-monthday-row-day-cover" v-if="day.selected"></span>
                  </transition>
                </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <ul class="e-calendar-year" v-show="showYear" ref="yearList">
        <li v-for="(item, index) in yearList" :key="index" :class="{
        active: item === selectDate.year,
        hover: isYearHovered(index)
      }" @click="selectYear(item)" @mouseenter="handleYearMouseEnter(index)" @mouseleave="handleYearMouseLeave()">
          {{ item }}
        </li>
      </ul>
      <ul class="e-calendar-year" v-show="showMonth" ref="monthList">
        <li v-for="(item, index) in monthList" :key="index" :class="{
        active: item === selectDate.month,
        hover: isMonthHovered(index)
      }" @click="selectMonth(item)" @mouseenter="handleMonthMouseEnter(index)" @mouseleave="handleMonthMouseLeave()">
          {{ getMonthName(item) }}
        </li>
      </ul>
    </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount, onMounted, onUnmounted, watchEffect, watch } from 'vue';
import { useI18n } from './i18n';
import { ganttThemeManager } from './themes/GanttThemes';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/ru';

export default defineComponent({
  props: {
    // 打开date picker的初始值，必传，格式是（2017-08-11）
    date: {
      type: String,
      required: true,
    },
    // 日期最小值
    minDate: String,
    // 日期最大值
    maxDate: String,
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    
    // 获取 dayjs locale
    const getDayjsLocale = () => {
      const localeMap: Record<string, string> = {
        'zh-CN': 'zh-cn',
        'en-US': 'en',
        'ja-JP': 'ja',
        'ko-KR': 'ko',
        'fr-FR': 'fr',
        'de-DE': 'de',
        'es-ES': 'es',
        'ru-RU': 'ru'
      };
      return localeMap[locale.value] || 'en';
    };
    
    // 获取星期名称
    const getWeekNames = computed(() => {
      const dayjsLocale = getDayjsLocale();
      const weekNames = [];
      for (let i = 1; i <= 7; i++) {
        // 使用 dayjs 获取本地化的星期名称（简写）
        const day = dayjs().day(i).locale(dayjsLocale);
        weekNames.push(day.format('dd'));
      }
      return weekNames;
    });
    
    // 获取月份名称
    const getMonthName = (month: number) => {
      const dayjsLocale = getDayjsLocale();
      return dayjs().month(month - 1).locale(dayjsLocale).format('MMMM');
    };
    
    // 定义响应式数据
    let selectDate = ref({
      year: 0,
      month: 0,
      day: 0,
      week: 0,
      date: '',
      weekStr: '',
      monthStr: '',
    });
    let showDate = ref({
      year: 0,
      month: 0,
      day: 0,
      week: 0,
      date: '',
      monthStr: '',
      weekStr: '',
    });
    let copyMinDate = ref({
      year: 0,
      month: 0,
      day: 0,
    });
    let copyMaxDate = ref({
      year: 0,
      month: 0,
      day: 0,
    });

    const fadeXType = ref('fadeX_Prev');
    const nextMonthClick = ref(false);
    const prevMonthClick = ref(false);
    const showYear = ref(false);
    const showMonth = ref(false);
    const yearListRef = ref<HTMLUListElement | null>(null);
    const monthListRef = ref<HTMLUListElement | null>(null);
    const showCalendar = ref(false); // 控制日期选择器的显示和隐藏
    const selectedDateText = ref(''); // 文本框显示的日期
    const calendarRef = ref<HTMLDivElement | null>(null); // 日期组件的引用
    const inputRef = ref<HTMLInputElement | null>(null); // 新增文本框引用
    const calendarTop = ref(0);
    const calendarLeft = ref(0);
    const currentTheme = ref(ganttThemeManager.getCurrentTheme());

    // 计算日历弹出层的位置（因为使用了 Teleport 传送到 body）
    const calendarPosition = computed(() => ({
      position: 'fixed' as const,
      top: `${calendarTop.value}px`,
      left: `${calendarLeft.value}px`,
      zIndex: 100002
    }));

    const hoveredYearIndex = ref(-1);
    const hoveredMonthIndex = ref(-1);
    const hoveredDayIndex = ref({ row: -1, col: -1 });

    const yearList = computed(() => {
      const result: number[] = [];
      for (let i = copyMinDate.value.year; i <= copyMaxDate.value.year; i += 1) {
        result.push(i);
      }
      return result;
    });

    const monthList = computed(() => {
      const result: number[] = [];
      for (let i = 1; i <= 12; i += 1) {
        result.push(i);
      }
      return result;
    });

    const rows = computed(() => {
      const { year, month } = showDate.value;
      const months = new Date(year, month, 0).getDate();
      const result: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[][] = [];
      let row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[] = [];
      let weekValue: number;
      // 按照星期分组
      for (let i = 1; i <= months; i += 1) {
        // 根据日期获取星期，并让开头是1，而非0
        weekValue = new Date(year, month - 1, i).getDay() + 1;
        // 判断月第一天在星期几，并填充前面的空白区域
        if (i === 1 && weekValue !== 1) {
          addRowEmptyValue(row, weekValue);
          addRowDayValue(row, i);
        } else {
          addRowDayValue(row, i);
          // 判断月最后一天在星期几，并填充后面的空白区域
          if (i === months && weekValue !== 7) {
            addRowEmptyValue(row, (7 - weekValue) + 1);
          }
        }
        // 按照一周分组
        if (weekValue % 7 === 0 || i === months) {
          result.push(row);
          row = [];
        }
      }
      showDate.value.monthStr = getMonthName(showDate.value.month);
      return result;
    });

    // 定义函数，接收一个 number 类型的参数，返回一个 string 类型的值
    const keepDoubleDigit = (number: number): string => {
      // 判断传入的数字是否大于 9
      return number > 9 ? String(number) : `0${number}`;
    };

    // 拆分日期
    const splitDate = (date: string, addStr = false) => {
      let result: {
        year: number;
        month: number;
        day: number;
        week?: number;
        monthStr?: string;
        weekStr?: string;
      } = {
        year: 0,
        month: 0,
        day: 0,
      };
      const splitValue = date.split('-');
      try {
        if (!splitValue || splitValue.length < 3) {
          throw new Error('时间格式不正确');
        }
        result = {
          year: Number(splitValue[0]),
          month: Number(splitValue[1]),
          day: Number(splitValue[2]),
        };
        if (addStr) {
          result.week = new Date(result.year, result.month - 1, result.day).getDay() + 1;
          result.monthStr = getMonthName(result.month);
          const dayjsLocale = getDayjsLocale();
          result.weekStr = dayjs().day(result.week).locale(dayjsLocale).format('dddd');
        }
      } catch (error) {
        console.error(error);
      }
      return result;
    };

    // 初始化日期选择器
    const initDatePicker = () => {
      const splitResult = splitDate(props.date, true);
      showDate.value = {
        ...splitResult,
        date: `${splitResult.year}-${keepDoubleDigit(splitResult.month)}-${keepDoubleDigit(
          splitResult.day
        )}`,
        week: splitResult.week || 0,
        monthStr: splitResult.monthStr || '',
        weekStr: splitResult.weekStr || '',
      };
      copyMinDate.value = { ...splitDate(props.minDate || '1970-01-01') };
      copyMaxDate.value = { ...splitDate(props.maxDate || '2099-12-31') };
      selectDate.value = { ...showDate.value };
      
      // 使用国际化日期格式
      const dayjsLocale = getDayjsLocale();
      const dateObj = dayjs(showDate.value.date).locale(dayjsLocale);
      const dateFormat = t('dateFormat.full');
      selectedDateText.value = dateObj.format(dateFormat);
    };

    watchEffect(() => {
      if (props.date) {
        initDatePicker(); // 当 props.date 变化时重新初始化日期选择器
      }
    });

    onBeforeMount(() => {
      initDatePicker();
    });

    // 添加空值
    const addRowEmptyValue = (
      row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[],
      count: number
    ) => {
      for (let w = 1; w < count; w += 1) {
        row.push({
          value: '',
        });
      }
    };

    // 添加日期值
    const addRowDayValue = (
      row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[],
      i: number
    ) => {
      const value = { value: i };
      const { day, month, year } = selectDate.value;
      const showDateValue = showDate.value;
      // 判断已经选择的
      if (year === showDateValue.year && month === showDateValue.month && day === i) {
        // 为对象添加 selected 属性
        const newValue = { ...value, selected: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      // 当日期在最小值之外，禁止点击
      if (isMinLimitMonth() && i < copyMinDate.value.day) {
        // 修复：添加 disabled 属性
        const newValue = { ...value, disabled: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      // 当日期在最大值之外，禁止点击
      if (isMaxLimitMonth() && i > copyMaxDate.value.day) {
        // 修复：添加 disabled 属性
        const newValue = { ...value, disabled: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      row.push(value);
    };

    // 切换到上一个月
    const prevMonth = () => {
      if (prevMonthClick.value) {
        return;
      }
      prevMonthClick.value = true;
      setTimeout(() => {
        prevMonthClick.value = false;
      }, 500);
      fadeXType.value = 'fadeX_Prev';
      // 如何当前月份已经小于等于minMonth 就不让其在执行
      if (isMinLimitMonth()) {
        return;
      }
      const { year, month } = showDate.value;
      // 判断当前月份，如果已经等于1（1就是一月，而不是二月）
      if (month <= 1) {
        showDate.value.year = year - 1;
        showDate.value.month = 12;
      } else {
        showDate.value.month -= 1;
      }
    };

    // 切换到下一个月
    const nextMonth = () => {
      if (nextMonthClick.value) {
        return;
      }
      nextMonthClick.value = true;
      setTimeout(() => {
        nextMonthClick.value = false;
      }, 500);
      fadeXType.value = 'fadeX_Next';
      // 如何当前月份已经大于等于maxMonth 就不让其在执行
      if (isMaxLimitMonth()) {
        return;
      }
      const { year, month } = showDate.value;
      // 判断当前月份，如果已经等于12（12就是十二月）
      if (month >= 12) {
        showDate.value.year = year + 1;
        showDate.value.month = 1;
      } else {
        showDate.value.month += 1;
      }
    };

    // 重置选择日期
    let resetSelectDate = (dayValue: number) => {
      // 修改为逐个修改属性
      selectDate.value.year = showDate.value.year;
      selectDate.value.month = showDate.value.month;
      selectDate.value.week = showDate.value.week;
      selectDate.value.date = showDate.value.date;
      selectDate.value.weekStr = showDate.value.weekStr;
      selectDate.value.monthStr = showDate.value.monthStr;
      selectDate.value.day = dayValue;
      selectDate.value.week = new Date(showDate.value.year, showDate.value.month - 1, dayValue).getDay() + 1;
      const dayjsLocale = getDayjsLocale();
      selectDate.value.weekStr = dayjs().day(selectDate.value.week).locale(dayjsLocale).format('dddd');
      
      // 使用国际化日期格式
      const dateObj = dayjs(`${selectDate.value.year}-${keepDoubleDigit(selectDate.value.month)}-${keepDoubleDigit(selectDate.value.day)}`).locale(dayjsLocale);
      const dateFormat = t('dateFormat.full');
      selectedDateText.value = dateObj.format(dateFormat);
      
      showCalendar.value = false; // 选择日期后隐藏日期选择器
    };

    // 选择日期
    const selectDay = (days: { value: number | string; disabled?: boolean }) => {
      if (days.disabled || days.value === '') {
        return;
      }
      resetSelectDate(Number(days.value));
      const { year, month, day, week, weekStr, monthStr } = selectDate.value;
      emit('confirm', {
        date: `${year}-${keepDoubleDigit(month)}-${keepDoubleDigit(day)}`,
        year,
        month,
        week,
        monthStr,
        weekStr,
        day,
      });
    };

    // 选择月份
    const selectMonth = (value: number) => {
      showYear.value = false;
      showMonth.value = false;
      showDate.value.month = value;
      let type: 'copyMinDate' | 'copyMaxDate' | undefined;
      // 当月份在最小值之外，日期换成最小值日期 或者 当月份在最大值之外，日期换成最大值日期
      if (isMinLimitMonth()) {
        type = 'copyMinDate';
      } else if (isMaxLimitMonth()) {
        type = 'copyMaxDate';
      }
      if (type) {
        showDate.value.day = type === 'copyMinDate' ? copyMinDate.value.day : copyMaxDate.value.day;
        resetSelectDate(showDate.value.day);
        return;
      }
      let dayValue = selectDate.value.day;
      // 判断日是最大值，防止另一个月没有这个日期
      const daysInMonth = new Date(showDate.value.year, showDate.value.month + 1, 0).getDate();
      dayValue = Math.min(dayValue, daysInMonth); // 确保日期不超过当前月份的最大天数
      resetSelectDate(dayValue);
    };

    // 选择年份
    const selectYear = (value: number) => {
      showYear.value = false;
      showMonth.value = false;
      showDate.value.year = value;
      let type: 'copyMinDate' | 'copyMaxDate' | undefined;
      // 当日期在最小值之外，月份换成最小值月份 或者 当日期在最大值之外，月份换成最大值月份
      if (isMinLimitMonth()) {
        type = 'copyMinDate';
      } else if (isMaxLimitMonth()) {
        type = 'copyMaxDate';
      }
      if (type) {
        showDate.value.month = type === 'copyMinDate' ? copyMinDate.value.month : copyMaxDate.value.month;
        showDate.value.day = type === 'copyMinDate' ? copyMinDate.value.day : copyMaxDate.value.day;
        resetSelectDate(showDate.value.day);
        return;
      }
      let dayValue = selectDate.value.day;
      // 判断日是最大值，防止另一个月没有这个日期
      const months = new Date(showDate.value.year, showDate.value.month, 0).getDate();
      dayValue = Math.min(dayValue, months); // 确保日期不超过当前月份的最大天数
      resetSelectDate(dayValue);
    };

    // 判断是否为最小月份限制
    const isMinLimitMonth = () => {
      return showDate.value.year <= copyMinDate.value.year && showDate.value.month <= copyMinDate.value.month;
    };

    // 判断是否为最大月份限制
    const isMaxLimitMonth = () => {
      return showDate.value.year >= copyMaxDate.value.year && showDate.value.month >= copyMaxDate.value.month;
    };

    // 打开年份列表
    const openYearList = () => {
      if (showYear.value) {
        showYear.value = false;
        showMonth.value = false;
        return;
      }
      const index = yearList.value.indexOf(selectDate.value.year);
      showYear.value = true;
      showMonth.value = false;
      setTimeout(() => {
        if (yearListRef.value) {
          yearListRef.value.scrollTop = (index - 3) * 40;
        }
      });
    };

    // 打开月份列表
    const openMonthList = () => {
      if (showMonth.value) {
        showYear.value = false;
        showMonth.value = false;
        return;
      }
      const index = monthList.value.indexOf(selectDate.value.month);
      showMonth.value = true;
      showYear.value = false;
      setTimeout(() => {
        if (monthListRef.value) {
          monthListRef.value.scrollTop = (index - 3) * 20;
        }
      });
    };

    const openCalendarList = () => {
      showYear.value = false;
    };

    // 清除日期的方法
    const clearDate = () => {
      selectedDateText.value = '';
      showCalendar.value = false;
    };

    // 将主题CSS变量应用到日历元素
    const applyThemeToCalendar = (themeId: string) => {
      if (!calendarRef.value) return;
      
      const theme = ganttThemeManager.getThemeInfo(themeId);
      if (!theme) return;
      
      // 设置主题属性
      calendarRef.value.setAttribute('data-gantt-theme', themeId);
      
      // 应用CSS变量到日历元素
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        calendarRef.value!.style.setProperty(property, value);
      });
    };

    // 打开日历并计算位置
    const openCalendar = () => {
      if (inputRef.value) {
        const rect = inputRef.value.getBoundingClientRect();
        calendarTop.value = rect.bottom + 5;
        calendarLeft.value = rect.left;
      }
      showCalendar.value = true;
      
      // 设置当前主题和CSS变量到日历元素
      setTimeout(() => {
        currentTheme.value = ganttThemeManager.getCurrentTheme();
        applyThemeToCalendar(currentTheme.value);
      }, 0);
    };

    // 点击文本框和日期组件以外的区域，隐藏日期组件
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.value &&
        inputRef.value &&
        !calendarRef.value.contains(event.target as Node) &&
        !inputRef.value.contains(event.target as Node)
      ) {
        showCalendar.value = false;
      }
    };

    const isYearHovered = (index: number) => hoveredYearIndex.value === index;
    const isMonthHovered = (index: number) => hoveredMonthIndex.value === index;
    const isDayHovered = (col: number, row: number) =>
      hoveredDayIndex.value.row === row && hoveredDayIndex.value.col === col;

    const handleYearMouseEnter = (index: number) => {
      hoveredYearIndex.value = index;
    };

    const handleYearMouseLeave = () => {
      hoveredYearIndex.value = -1;
    };

    const handleMonthMouseEnter = (index: number) => {
      hoveredMonthIndex.value = index;
    };

    const handleMonthMouseLeave = () => {
      hoveredMonthIndex.value = -1;
    };

    const handleDayMouseEnter = (col: number, row: number) => {
      hoveredDayIndex.value = { row, col };
    };

    const handleDayMouseLeave = () => {
      hoveredDayIndex.value = { row: -1, col: -1 };
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      
      // 监听主题变化，更新日历的 data-gantt-theme 属性和CSS变量
      const checkThemeChange = setInterval(() => {
        const newTheme = ganttThemeManager.getCurrentTheme();
        if (newTheme !== currentTheme.value) {
          currentTheme.value = newTheme;
          applyThemeToCalendar(newTheme);
        }
      }, 100);
      
      // 组件卸载时清除定时器
      onUnmounted(() => {
        clearInterval(checkThemeChange);
      });
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      t,
      locale,
      getWeekNames,
      getMonthName,
      selectDate,
      showDate,
      copyMinDate,
      copyMaxDate,
      fadeXType,
      nextMonthClick,
      prevMonthClick,
      keepDoubleDigit,
      showYear,
      yearList,
      rows,
      yearListRef,
      prevMonth,
      nextMonth,
      selectDay,
      selectYear,
      openYearList,
      openMonthList,
      monthList,
      monthListRef,
      showMonth,
      selectMonth,
      openCalendarList,
      showCalendar,
      openCalendar,
      selectedDateText,
      clearDate,
      calendarRef,
      inputRef,
      calendarPosition,
      isYearHovered,
      isMonthHovered,
      isDayHovered,
      handleYearMouseEnter,
      handleYearMouseLeave,
      handleMonthMouseEnter,
      handleMonthMouseLeave,
      handleDayMouseEnter,
      handleDayMouseLeave
    };
  },
});
</script>

<style lang="scss" scoped>
.e-calendar {
  background: var(--bg-content);
  width: 310px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-outset);
  z-index: 999;
  position: absolute;
  font-family: var(--font-family);
}

.e-date-select {
  background: var(--bg-active);
  padding: 12px 20px;
  color: var(--text-white);
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  box-shadow: var(--shadow-active);
}

.date-picker-input-wrapper {
  position: relative;
  display: inline-block;
}

.date-picker-input {
  width: 200px;
  padding: 8px 12px;
  background: var(--bg-content);
  border: 1px solid var(--border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-primary);
  transition: all var(--transition-fast);
  border-radius: 0;
}

.date-picker-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.clear-date-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-metal-normal);
  border: 1px solid var(--border);
  transition: all var(--transition-fast);
}

.clear-date-button:hover {
  background: var(--bg-metal-light);
}

.clear-date-button svg {
  fill: var(--text-secondary);
  width: 14px;
  height: 14px;
  transition: fill var(--transition-fast);
}

.clear-date-button:hover svg {
  fill: var(--text-primary);
}

.e-date-year {
  font-size: 18px;
  padding-bottom: 4px;
  position: relative;
  width: 66px;
  height: 25px;
  overflow: hidden;
  cursor: pointer;
}

.e-date-year-select {
  position: absolute;
  opacity: 0.7;
  font-size: 20px;
}

.e-date-year-select.active {
  opacity: 1;
}

.e-date-monthday {
  font-size: 26px;
  position: relative;
  width: 100%;
  height: 36px;
  overflow: hidden;
}

.e-date-monthday-select {
  position: absolute;
  opacity: 0.7;
}

.e-date-monthday-select.active {
  opacity: 1;
}

.e-calendar-toolbar {
  margin: 8px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-metal-normal);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-inset);
  padding: 0 8px;
}

.e-calendar-toolbar-title {
  position: relative;
  width: 120px;
  height: 22px;
  text-align: center;
}

.e-calendar-toolbar-title-content {
  position: absolute;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.e-calendar-svg {
  padding: 6px;
  position: relative;
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-metal-normal);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.e-calendar-svg:hover {
  background: var(--bg-metal-light);
}

.e-calendar-svg:active {
  background: var(--bg-metal-pressed);
}

.e-calendar-svg-icon {
  display: block;
  fill: var(--text-secondary);
  height: 20px;
  width: 20px;
  user-select: none;
  position: relative;
  z-index: 2;
  transition: fill var(--transition-fast);
}

.e-calendar-svg:hover .e-calendar-svg-icon {
  fill: var(--text-primary);
}

.e-calendar-svg-cover {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background: var(--bg-metal-pressed);
  opacity: 0;
  display: inline-block;
  transition: opacity var(--transition-fast);
}

.e-calendar-week {
  width: 100%;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  background: var(--bg-metal-dark);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.e-calendar-week-day {
  flex: 1;
  text-align: center;
}

.e-calendar-monthday {
  padding-top: 10px;
  font-size: 14px;
  position: relative;
  width: 100%;
  min-height: 220px;
  overflow: hidden;
}

.e-calendar-monthday-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

.e-calendar-monthday-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.e-calendar-monthday-row-day {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  position: relative;
  height: 35px;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.e-calendar-monthday-row-day.pointer {
  cursor: pointer;
  background: var(--bg-metal-light);
  border-color: var(--border);
}

.e-calendar-monthday-row-day.pointer:hover {
  background: var(--bg-metal-normal);
  border-color: var(--primary);
}

.e-calendar-monthday-row-day.active {
  color: var(--text-white);
  background: var(--bg-active);
  border-color: var(--primary-dark);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.e-calendar-monthday-row-day.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--bg-metal-dark);
}

.e-calendar-monthday-row-day-value {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 500;
}

.e-calendar-monthday-row-day-cover {
  width: 100%;
  height: 100%;
  background: var(--bg-active);
  position: absolute;
  left: 0;
  top: 0;
  transform: translate3d(0, 0, 0);
  z-index: 0;
  opacity: 1;
  display: block;
}

.e-calendar-monthday-row-day.hover {
  background: var(--bg-metal-normal);
  border-color: var(--primary);
}

.e-calendar-year {
  height: 276px;
  overflow: auto;
  background: var(--bg-content);
  border-top: 1px solid var(--border);
}

.e-calendar-year li {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  background: var(--bg-metal-light);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.e-calendar-year li:hover {
  background: var(--bg-metal-normal);
  color: var(--primary);
}

.e-calendar-year li.active {
  color: var(--text-white);
  background: var(--bg-active);
  font-weight: 700;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.e-calendar-year li.hover {
  background: var(--bg-metal-normal);
}

.fadeX_Prev-enter-active,
.fadeX_Prev-leave-active,
.fadeX_Next-enter-active,
.fadeX_Next-leave-active,
.fadeY-enter-active,
.fadeY-leave-active {
  transition: all 0.5s;
}

.fadeX_Prev-enter {
  transform: translateX(-100px);
  opacity: 0;
}

.fadeX_Prev-leave-active {
  transform: translateX(100px);
  opacity: 0;
}

.fadeX_Next-enter {
  transform: translateX(100px);
  opacity: 0;
}

.fadeX_Next-leave-active {
  transform: translateX(-100px);
  opacity: 0;
}

.fadeY-enter {
  transform: translateY(30px);
  opacity: 0;
}

.fadeY-leave-active {
  transform: translateY(-30px);
  opacity: 0;
}

.e_calendar_svg_btn-enter-active,
.e_calendar_svg_btn-leave-active {
  transition: all 1s;
}

.e_calendar_svg_btn-enter {
  opacity: 1;
}

.e_calendar_day-enter-active {
  transition: all 0.2s;
}

.e_calendar_svg_btn-leave-active,
.e_calendar_day-enter {
  opacity: 0;
}

.e_calendar_day-enter {
  width: 0;
  height: 0;
  transform: translate3d(12px, 12px, 0);
}
</style>

<!-- 非 scoped 样式 - 用于 Teleport 到 body 的日历组件 -->
<style lang="scss">
/* Teleport 到 body 的日历组件样式 - 非 LiquidGlass 主题使用 */
/* 注意：LiquidGlass 主题的样式在 LiquidGlass.css 中定义 */
body > .e-calendar:not([data-gantt-theme="liquidGlass"]) {
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
  width: 310px;
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  border-radius: 8px;
  overflow: hidden;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-select {
  background: var(--bg-active, #0078d4);
  padding: 12px 20px;
  color: var(--text-white, #ffffff);
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  box-shadow: var(--shadow-active);
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year {
  font-size: 18px;
  padding-bottom: 4px;
  position: relative;
  width: 66px;
  height: 25px;
  overflow: hidden;
  cursor: pointer;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year-select {
  position: absolute;
  opacity: 0.7;
  font-size: 20px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year-select.active {
  opacity: 1;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday {
  font-size: 26px;
  position: relative;
  width: 100%;
  height: 36px;
  overflow: hidden;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday-select {
  position: absolute;
  opacity: 0.7;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday-select.active {
  opacity: 1;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-container {
  padding: 8px;
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar {
  margin: 0 0 8px 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-metal-normal, #f0f0f0);
  border: 1px solid var(--border, #d0d0d0);
  padding: 0 8px;
  border-radius: 4px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar-title {
  position: relative;
  width: 120px;
  height: 22px;
  text-align: center;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar-title-content {
  position: absolute;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg {
  padding: 6px;
  position: relative;
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-metal-normal, #f0f0f0);
  border: 1px solid var(--border, #d0d0d0);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg:hover {
  background: var(--bg-metal-light, #e8e8e8);
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg-icon {
  display: block;
  fill: var(--text-secondary, #666);
  height: 20px;
  width: 20px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-week {
  width: 100%;
  display: flex;
  font-size: 12px;
  color: var(--text-secondary, #666);
  border-bottom: 1px solid var(--border, #d0d0d0);
  padding-bottom: 8px;
  margin-bottom: 8px;
  background: var(--bg-secondary, #f8f9fa); /* 使用CSS变量支持主题切换 */
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-week-day {
  flex: 1;
  text-align: center;
  font-weight: 600;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday {
  width: 100%;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row {
  display: flex;
  width: 100%;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.pointer {
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  background: var(--bg-secondary, #f8f9fa); /* 使用CSS变量支持主题切换 */
  margin: 2px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.pointer:hover {
  background: var(--bg-hover, rgba(0, 120, 212, 0.1));
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.active {
  background: var(--bg-active, #0078d4);
  color: #fff;
  border-radius: 4px;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day-value {
  font-size: 14px;
  color: var(--text-primary, #333);
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.active .e-calendar-monthday-row-day-value {
  color: #fff;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.disabled .e-calendar-monthday-row-day-value {
  color: var(--text-disabled, #ccc);
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year {
  list-style: none;
  padding: 8px;
  margin: 0;
  max-height: 280px;
  overflow-y: auto;
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li {
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  font-size: 16px;
  color: var(--text-primary, #333);
  background: var(--bg-secondary, #f8f9fa); /* 使用CSS变量支持主题切换 */
  margin: 2px 0;
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li:hover {
  background: var(--bg-hover, rgba(0, 120, 212, 0.1));
}

body > .e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li.active {
  background: var(--bg-active, #0078d4);
  color: #fff;
}
</style>