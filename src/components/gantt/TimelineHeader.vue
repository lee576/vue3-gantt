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
            <svg t="1647262391689" v-if="isToday(item.fulldate)"  class="today" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4965" width="200" height="200"><path d="M753.6 222.4h24c19.2 0 33.6-14.4 33.6-32V57.6c0-19.2-14.4-33.6-33.6-33.6h-24c-19.2 0-33.6 14.4-33.6 33.6v131.2c0 19.2 14.4 33.6 33.6 33.6zM251.2 222.4h24c19.2 0 33.6-14.4 33.6-32V57.6c0-19.2-14.4-33.6-33.6-33.6h-24c-19.2 0-33.6 14.4-33.6 33.6v131.2c0 19.2 14.4 33.6 33.6 33.6z" fill="#707070" p-id="4966"></path><path d="M928 134.4h-68.8v56c0 41.6-33.6 76.8-80 76.8h-24c-43.2 0-80-33.6-80-76.8V134.4h-320v56c0 41.6-33.6 76.8-80 76.8h-24c-43.2 0-80-33.6-80-76.8V134.4H105.6c-38.4 0-68.8 28.8-68.8 67.2v731.2c0 38.4 30.4 67.2 68.8 67.2h820.8c38.4 0 68.8-28.8 70.4-67.2V201.6c0-38.4-30.4-67.2-68.8-67.2zM105.6 932.8V355.2h820.8s0 577.6 1.6 577.6H105.6z" fill="#707070" p-id="4967"></path><path d="M500.8 548.8l-49.6 33.6c14.4 16 33.6 41.6 60.8 75.2l54.4-35.2c-19.2-22.4-40-46.4-65.6-73.6z" fill="#707070" p-id="4968"></path><path d="M553.6 451.2l14.4-14.4v-1.6H480c-51.2 68.8-118.4 121.6-196.8 155.2 11.2 12.8 25.6 28.8 41.6 54.4 80-40 142.4-89.6 188.8-148.8 43.2 59.2 102.4 107.2 180.8 144 14.4-19.2 27.2-35.2 41.6-52.8-76.8-30.4-137.6-76.8-182.4-136zM339.2 716.8h246.4c-30.4 43.2-62.4 81.6-94.4 116.8l60.8 33.6c49.6-56 89.6-108.8 123.2-155.2v-54.4h-336v59.2z" fill="#707070" p-id="4969"></path></svg>
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
        const dayjsLocale = locale.value === 'en-US' ? 'en' : 'zh-cn';
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