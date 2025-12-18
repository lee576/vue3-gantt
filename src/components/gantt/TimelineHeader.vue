<template>
    <div class="headerContainer">
      <div v-if="monthHeaders && monthHeaders.length > 0" class="header">
        <template v-for='item in monthHeaders' :key="item.title">
          <div class="headerCaption" style="border-bottom:0px" :style="{ width: item.width + 'px' }"><span :style="{ width: item.width + 'px' }">{{item.title}}</span></div>
        </template>
      </div>
      <div v-if="weekHeaders && weekHeaders.length > 0" class="header">
        <template v-for='item in weekHeaders' :key="item.title">
          <div class="headerCaption" style="border-top:1px" :style="{ width: item.width + 'px' }"><span :style="{ width: item.width + 'px' }">{{item.title}}</span>
          </div>
        </template>
      </div>
      <div v-if="dayHeaders && dayHeaders.length > 0" class="header">
        <!-- 移除未使用的索引变量 -->
        <template v-for='item in dayHeaders' :key="item.title">
          <div class="headerCaption" :style="{ width: item.width + 'px' }"><span :style="{ width: item.width + 'px' }">{{item.title}}</span>
            <svg v-if="isToday(item.fulldate)" class="today" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <!-- 日历图标 -->
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
              <!-- 今天的圆点标记 -->
              <circle cx="12" cy="15" r="2" fill="currentColor"/>
              <!-- 向下的箭头，表示"定位到今天" -->
              <path d="M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
      </div>
      <div v-if="hourHeaders && hourHeaders.length > 0" class="header">
        <template v-for='item in hourHeaders' :key="item.title">
          <div class="headerCaption" :style="{ width: item.width + 'px',marginTop: '-2px' }"><span :style="{ width: item.width + 'px' }">{{item.title}}</span></div>
        </template>
      </div>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, toRefs } from 'vue';
  import dayjs from 'dayjs';
  import { useI18n } from './i18n';

  export default defineComponent({
    props: {
      weekHeaders: {
        type: Array as () => Array<{ title: string; width: number }>,
        default: () => []
      },
      dayHeaders: {
        type: Array as () => Array<{ title: string; width: number; fulldate: string }>,
        default: () => []
      },
      monthHeaders: {
        type: Array as () => Array<{ title: string; width: number }>,
        default: () => []
      },
      hourHeaders: {
        type: Array as () => Array<{ title: string; width: number }>,
        default: () => []
      }
    },
    setup(props) {
      const { weekHeaders, dayHeaders, monthHeaders, hourHeaders } = toRefs(props);
      const { locale } = useI18n();

      const isToday = (title: string) => {
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
        const dayjsLocale = localeMap[locale.value] || 'en';
        return title === dayjs().locale(dayjsLocale).format('YYYY-MM-DD');
      };

      return {
        weekHeaders,
        dayHeaders,
        monthHeaders,
        hourHeaders,
        isToday
      };
    }
  });
  </script>
  <style lang="scss" scoped>
  .headerContainer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  }

  .header {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    border-bottom: 1px solid var(--border, #cecece);
  }

  .headerCaption {
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    color: var(--text-primary, #333333);
    font-size: 12px;
    font-weight: 600;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    position: relative;
    letter-spacing: 0.5px;
    transition: all var(--transition-fast, 0.15s ease);
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-top: 1px solid var(--border, #cecece);
        border-right: 1px solid var(--border, #cecece);
        pointer-events: none;
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
    }
}

  .today {
    position: absolute;
    z-index: 10;
    top: 2px;
    left: 2px;
    height: 20px;
    width: 25px;
    fill: var(--text-secondary, #707070);
    transition: fill var(--transition-fast, 0.15s ease);
  }

  .today:hover {
    fill: var(--primary, #3A8EE6);
  }
  </style>