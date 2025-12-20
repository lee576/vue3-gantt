<template>
  <div>
    <!-- 添加文本框 -->
    <div class="date-picker-input-wrapper">
      <input type="text" v-model="selectedDateText" @click="openCalendar" readonly
        :placeholder="t('datePicker.selectDate')" class="date-picker-input" ref="inputRef" />
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
              <div :key="showDate.year" class="e-date-year-select" @click="openYearList" :class="{ active: showYear }">
                {{ showDate.year }}
              </div>
            </transition>
          </div>
          <div class="e-date-monthday">
            <transition name="fadeY">
              <div :key="showDate.year + '-' + showDate.month" class="e-date-monthday-select"
                :class="{ active: !showYear }" @click="openCalendarList">
                <span>{{ keepDoubleDigit(showDate.month) }}-{{ keepDoubleDigit(selectDate.day) }}</span>&nbsp;
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
                <div :key="showDate.year + '-' + showDate.month" class="e-calendar-toolbar-title-content">
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
            <span v-for="(weekName, index) in getWeekNames" :key="index" class="e-calendar-week-day">{{ weekName
              }}</span>
          </div>
          <div class="e-calendar-monthday">
            <div :key="updateKey" class="e-calendar-monthday-wrapper">
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
          </div>
        </div>
        <ul class="e-calendar-year" v-show="showYear" ref="yearListRef">
          <li v-for="(item, index) in yearList" :key="index" :class="{
            active: item === selectDate.year,
            hover: isYearHovered(index)
          }" @click="selectYear(item)" @mouseenter="handleYearMouseEnter(index)" @mouseleave="handleYearMouseLeave()">
            {{ item }}
          </li>
        </ul>
        <ul class="e-calendar-year" v-show="showMonth" ref="monthListRef">
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
import { defineComponent, ref, computed, onBeforeMount, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from '../i18n';
import { ganttThemeManager } from '../themes/GanttThemes';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/ru';

interface DayCell {
  value: number | string;
  selected?: boolean;
  disabled?: boolean;
}

export default defineComponent({
  props: {
    date: { type: String, required: true },
    minDate: String,
    maxDate: String,
  },
  emits: ['confirm', 'clear'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    // dayjs locale 映射
    const getDayjsLocale = () => {
      const map: Record<string, string> = {
        'zh-CN': 'zh-cn', 'zh-TW': 'zh-tw', 'en-US': 'en', 'ja-JP': 'ja', 'ko-KR': 'ko',
        'fr-FR': 'fr', 'de-DE': 'de', 'es-ES': 'es', 'ru-RU': 'ru'
      };
      return map[locale.value] || 'en';
    };

    // 星期名称
    const getWeekNames = computed(() => {
      const loc = getDayjsLocale();
      return Array.from({ length: 7 }, (_, i) => dayjs().day(i + 1).locale(loc).format('dd'));
    });

    // 月份名称
    const getMonthName = (month: number) => {
      return dayjs().month(month - 1).locale(getDayjsLocale()).format('MMMM');
    };

    // 状态
    const showCalendar = ref(false);
    const showYear = ref(false);
    const showMonth = ref(false);
    const selectedDateText = ref('');
    const updateKey = ref(0);
    const fadeXType = ref('fadeX_Prev');
    const prevMonthClick = ref(false);
    const nextMonthClick = ref(false);
    const calendarRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const yearListRef = ref<HTMLElement | null>(null);
    const monthListRef = ref<HTMLElement | null>(null);
    const calendarTop = ref(0);
    const calendarLeft = ref(0);
    const currentTheme = ref(ganttThemeManager.getCurrentTheme());
    const hoveredYearIndex = ref(-1);
    const hoveredMonthIndex = ref(-1);
    const hoveredDayIndex = ref({ row: -1, col: -1 });

    // 当前显示的年月
    const displayYear = ref(new Date().getFullYear());
    const displayMonth = ref(new Date().getMonth() + 1);

    // 已选中的日期
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const selectedDay = ref(new Date().getDate());

    // 日期限制
    const minYear = ref(1970);
    const minMonth = ref(1);
    const minDay = ref(1);
    const maxYear = ref(2099);
    const maxMonth = ref(12);
    const maxDay = ref(31);

    // 解析日期字符串
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
      return { year: y, month: m, day: d };
    };

    // 保持两位数
    const keepDoubleDigit = (n: number) => (n > 9 ? String(n) : `0${n}`);

    // 计算属性
    const showDate = computed(() => ({
      year: displayYear.value,
      month: displayMonth.value,
      monthStr: getMonthName(displayMonth.value)
    }));

    const selectDate = computed(() => ({
      year: selectedYear.value,
      month: selectedMonth.value,
      day: selectedDay.value
    }));

    const yearList = computed(() => {
      const result: number[] = [];
      for (let i = minYear.value; i <= maxYear.value; i++) result.push(i);
      return result;
    });

    const monthList = computed(() => Array.from({ length: 12 }, (_, i) => i + 1));

    const calendarPosition = computed(() => ({
      position: 'fixed' as const,
      top: `${calendarTop.value}px`,
      left: `${calendarLeft.value}px`,
      zIndex: 100002
    }));

    // 判断是否在最小月份限制
    const isMinLimitMonth = () => {
      return displayYear.value < minYear.value ||
        (displayYear.value === minYear.value && displayMonth.value <= minMonth.value);
    };

    // 判断是否在最大月份限制
    const isMaxLimitMonth = () => {
      return displayYear.value > maxYear.value ||
        (displayYear.value === maxYear.value && displayMonth.value >= maxMonth.value);
    };

    // 生成日历行
    const rows = computed(() => {
      void updateKey.value; // 依赖 updateKey 强制刷新
      const year = displayYear.value;
      const month = displayMonth.value;
      const daysInMonth = new Date(year, month, 0).getDate();
      const result: DayCell[][] = [];
      let row: DayCell[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const rawWeekDay = new Date(year, month - 1, day).getDay();
        const weekDay = rawWeekDay === 0 ? 7 : rawWeekDay; // 周一=1, 周日=7

        // 第一天前填充空白
        if (day === 1 && weekDay > 1) {
          for (let i = 1; i < weekDay; i++) row.push({ value: '' });
        }

        // 判断是否选中
        const isSelected = year === selectedYear.value && month === selectedMonth.value && day === selectedDay.value;
        
        // 判断是否禁用
        let isDisabled = false;
        if (year === minYear.value && month === minMonth.value && day < minDay.value) isDisabled = true;
        if (year === maxYear.value && month === maxMonth.value && day > maxDay.value) isDisabled = true;

        row.push({ value: day, selected: isSelected, disabled: isDisabled });

        // 最后一天后填充空白
        if (day === daysInMonth && weekDay < 7) {
          for (let i = weekDay; i < 7; i++) row.push({ value: '' });
        }

        // 周日结束一行
        if (weekDay === 7 || day === daysInMonth) {
          result.push(row);
          row = [];
        }
      }
      return result;
    });

    // 初始化
    const init = () => {
      const parsed = parseDate(props.date);
      if (parsed) {
        displayYear.value = parsed.year;
        displayMonth.value = parsed.month;
        selectedYear.value = parsed.year;
        selectedMonth.value = parsed.month;
        selectedDay.value = parsed.day;
      } else {
        const now = new Date();
        displayYear.value = now.getFullYear();
        displayMonth.value = now.getMonth() + 1;
        selectedYear.value = now.getFullYear();
        selectedMonth.value = now.getMonth() + 1;
        selectedDay.value = now.getDate();
      }

      const minParsed = parseDate(props.minDate || '1970-01-01');
      if (minParsed) {
        minYear.value = minParsed.year;
        minMonth.value = minParsed.month;
        minDay.value = minParsed.day;
      }

      const maxParsed = parseDate(props.maxDate || '2099-12-31');
      if (maxParsed) {
        maxYear.value = maxParsed.year;
        maxMonth.value = maxParsed.month;
        maxDay.value = maxParsed.day;
      }

      updateSelectedDateText();
    };

    const updateSelectedDateText = () => {
      const dateStr = `${selectedYear.value}-${keepDoubleDigit(selectedMonth.value)}-${keepDoubleDigit(selectedDay.value)}`;
      const loc = getDayjsLocale();
      const fmt = t('dateFormat.full');
      selectedDateText.value = dayjs(dateStr).locale(loc).format(fmt);
    };

    // 选择年份
    const selectYear = (year: number) => {
      displayYear.value = year;
      showYear.value = false;
      showMonth.value = false;
      updateKey.value++;
    };

    // 选择月份
    const selectMonth = (month: number) => {
      displayMonth.value = month;
      showYear.value = false;
      showMonth.value = false;
      updateKey.value++;
    };

    // 选择日期
    const selectDay = (cell: DayCell) => {
      if (cell.disabled || cell.value === '') return;
      selectedYear.value = displayYear.value;
      selectedMonth.value = displayMonth.value;
      selectedDay.value = cell.value as number;
      updateSelectedDateText();
      showCalendar.value = false;

      const rawWeek = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value).getDay();
      const week = rawWeek === 0 ? 7 : rawWeek;
      const loc = getDayjsLocale();
      const weekStr = dayjs(`${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`).locale(loc).format('dddd');

      emit('confirm', {
        date: `${selectedYear.value}-${keepDoubleDigit(selectedMonth.value)}-${keepDoubleDigit(selectedDay.value)}`,
        year: selectedYear.value,
        month: selectedMonth.value,
        day: selectedDay.value,
        week,
        weekStr,
        monthStr: getMonthName(selectedMonth.value)
      });
    };

    // 上一月
    const prevMonth = () => {
      if (prevMonthClick.value || isMinLimitMonth()) return;
      prevMonthClick.value = true;
      setTimeout(() => prevMonthClick.value = false, 300);
      fadeXType.value = 'fadeX_Prev';
      
      if (displayMonth.value <= 1) {
        displayYear.value--;
        displayMonth.value = 12;
      } else {
        displayMonth.value--;
      }
      updateKey.value++;
    };

    // 下一月
    const nextMonth = () => {
      if (nextMonthClick.value || isMaxLimitMonth()) return;
      nextMonthClick.value = true;
      setTimeout(() => nextMonthClick.value = false, 300);
      fadeXType.value = 'fadeX_Next';

      if (displayMonth.value >= 12) {
        displayYear.value++;
        displayMonth.value = 1;
      } else {
        displayMonth.value++;
      }
      updateKey.value++;
    };

    // 打开年份列表
    const openYearList = () => {
      showYear.value = !showYear.value;
      showMonth.value = false;
      if (showYear.value && yearListRef.value) {
        const idx = yearList.value.indexOf(selectedYear.value);
        setTimeout(() => {
          if (yearListRef.value) yearListRef.value.scrollTop = Math.max(0, (idx - 3)) * 40;
        }, 0);
      }
    };

    // 打开月份列表
    const openMonthList = () => {
      showMonth.value = !showMonth.value;
      showYear.value = false;
      if (showMonth.value && monthListRef.value) {
        const idx = selectedMonth.value - 1;
        setTimeout(() => {
          if (monthListRef.value) monthListRef.value.scrollTop = Math.max(0, (idx - 3)) * 40;
        }, 0);
      }
    };

    const openCalendarList = () => { showYear.value = false; };

    // 打开日历
    const openCalendar = () => {
      if (inputRef.value) {
        const rect = inputRef.value.getBoundingClientRect();
        calendarTop.value = rect.bottom + 5;
        calendarLeft.value = rect.left;
      }
      showCalendar.value = true;
      setTimeout(() => {
        currentTheme.value = ganttThemeManager.getCurrentTheme();
        applyThemeToCalendar(currentTheme.value);
      }, 0);
    };

    // 清除日期
    const clearDate = () => {
      selectedDateText.value = '';
      showCalendar.value = false;
      emit('clear');
    };

    // 应用主题
    const applyThemeToCalendar = (themeId: string) => {
      if (!calendarRef.value) return;
      const theme = ganttThemeManager.getThemeInfo(themeId);
      if (!theme) return;
      calendarRef.value.setAttribute('data-gantt-theme', themeId);
      Object.entries(theme.cssVariables).forEach(([prop, val]) => {
        calendarRef.value!.style.setProperty(prop, val);
      });
    };

    // 点击外部关闭
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.value && inputRef.value &&
          !calendarRef.value.contains(e.target as Node) &&
          !inputRef.value.contains(e.target as Node)) {
        showCalendar.value = false;
      }
    };

    // hover 状态
    const isYearHovered = (idx: number) => hoveredYearIndex.value === idx;
    const isMonthHovered = (idx: number) => hoveredMonthIndex.value === idx;
    const isDayHovered = (col: number, row: number) => hoveredDayIndex.value.row === row && hoveredDayIndex.value.col === col;
    const handleYearMouseEnter = (idx: number) => hoveredYearIndex.value = idx;
    const handleYearMouseLeave = () => hoveredYearIndex.value = -1;
    const handleMonthMouseEnter = (idx: number) => hoveredMonthIndex.value = idx;
    const handleMonthMouseLeave = () => hoveredMonthIndex.value = -1;
    const handleDayMouseEnter = (col: number, row: number) => hoveredDayIndex.value = { row, col };
    const handleDayMouseLeave = () => hoveredDayIndex.value = { row: -1, col: -1 };

    // 生命周期
    onBeforeMount(() => init());
    
    watch(() => props.date, () => init());
    watch(() => props.minDate, () => init());
    watch(() => props.maxDate, () => init());
    
    // 监听语言切换，更新日期显示格式
    watch(() => locale.value, () => {
      // 重新格式化已选择的日期文本
      if (selectedDateText.value) {
        updateSelectedDateText();
      }
      // 强制刷新日历，更新星期名称和月份名称
      updateKey.value++;
    });

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      const checkTheme = setInterval(() => {
        const newTheme = ganttThemeManager.getCurrentTheme();
        if (newTheme !== currentTheme.value) {
          currentTheme.value = newTheme;
          applyThemeToCalendar(newTheme);
        }
      }, 100);
      onUnmounted(() => clearInterval(checkTheme));
    });

    onUnmounted(() => document.removeEventListener('click', handleClickOutside));

    return {
      t, locale, getWeekNames, getMonthName, selectDate, showDate,
      copyMinDate: computed(() => ({ year: minYear.value, month: minMonth.value, day: minDay.value })),
      copyMaxDate: computed(() => ({ year: maxYear.value, month: maxMonth.value, day: maxDay.value })),
      fadeXType, nextMonthClick, prevMonthClick, keepDoubleDigit, showYear, updateKey,
      yearList, rows, yearListRef, prevMonth, nextMonth, selectDay, selectYear,
      openYearList, openMonthList, monthList, monthListRef, showMonth, selectMonth,
      openCalendarList, showCalendar, openCalendar, selectedDateText, clearDate,
      calendarRef, inputRef, calendarPosition,
      isYearHovered, isMonthHovered, isDayHovered,
      handleYearMouseEnter, handleYearMouseLeave,
      handleMonthMouseEnter, handleMonthMouseLeave,
      handleDayMouseEnter, handleDayMouseLeave
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
body>.e-calendar:not([data-gantt-theme="liquidGlass"]) {
  background: var(--bg-content, #ffffff);
  /* 使用CSS变量支持主题切换 */
  width: 310px;
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  border-radius: 8px;
  overflow: hidden;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-select {
  background: var(--bg-active, #0078d4);
  padding: 12px 20px;
  color: var(--text-white, #ffffff);
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  box-shadow: var(--shadow-active);
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year {
  font-size: 18px;
  padding-bottom: 4px;
  position: relative;
  width: 66px;
  height: 25px;
  overflow: hidden;
  cursor: pointer;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year-select {
  position: absolute;
  opacity: 0.7;
  font-size: 20px;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-year-select.active {
  opacity: 1;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday {
  font-size: 26px;
  position: relative;
  width: 100%;
  height: 36px;
  overflow: hidden;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday-select {
  position: absolute;
  opacity: 0.7;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-date-monthday-select.active {
  opacity: 1;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-container {
  padding: 8px;
  background: var(--bg-content, #ffffff);
  /* 使用CSS变量支持主题切换 */
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar {
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

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar-title {
  position: relative;
  width: 120px;
  height: 22px;
  text-align: center;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-toolbar-title-content {
  position: absolute;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg {
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

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg:hover {
  background: var(--bg-metal-light, #e8e8e8);
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-svg-icon {
  display: block;
  fill: var(--text-secondary, #666);
  height: 20px;
  width: 20px;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-week {
  width: 100%;
  display: flex;
  font-size: 12px;
  color: var(--text-secondary, #666);
  border-bottom: 1px solid var(--border, #d0d0d0);
  padding-bottom: 8px;
  margin-bottom: 8px;
  background: var(--bg-secondary, #f8f9fa);
  /* 使用CSS变量支持主题切换 */
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-week-day {
  flex: 1;
  text-align: center;
  font-weight: 600;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday {
  width: 100%;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row {
  display: flex;
  width: 100%;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-content, #ffffff);
  /* 使用CSS变量支持主题切换 */
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.pointer {
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  background: var(--bg-secondary, #f8f9fa);
  /* 使用CSS变量支持主题切换 */
  margin: 2px;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.pointer:hover {
  background: var(--bg-hover, rgba(0, 120, 212, 0.1));
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.active {
  background: var(--bg-active, #0078d4);
  color: #fff;
  border-radius: 4px;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day-value {
  font-size: 14px;
  color: var(--text-primary, #333);
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.active .e-calendar-monthday-row-day-value {
  color: #fff;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-monthday-row-day.disabled .e-calendar-monthday-row-day-value {
  color: var(--text-disabled, #ccc);
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year {
  list-style: none;
  padding: 8px;
  margin: 0;
  max-height: 280px;
  overflow-y: auto;
  background: var(--bg-content, #ffffff);
  /* 使用CSS变量支持主题切换 */
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li {
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  font-size: 16px;
  color: var(--text-primary, #333);
  background: var(--bg-secondary, #f8f9fa);
  /* 使用CSS变量支持主题切换 */
  margin: 2px 0;
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li:hover {
  background: var(--bg-hover, rgba(0, 120, 212, 0.1));
}

body>.e-calendar:not([data-gantt-theme="liquidGlass"]) .e-calendar-year li.active {
  background: var(--bg-active, #0078d4);
  color: #fff;
}
</style>