<template>
    <div class="header">
      <template v-for='(item, index) in headers' :key="index">
        <div :property='item.property' :columnindex='index' v-show="item.show" class="headerCaption">
          <span :style="{ width: `${item.width}px` }">{{ getHeaderTitle(item) }}</span>
        </div>
      </template>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue';
  import { useI18n } from '../i18n';

  export default defineComponent({
    props: {
      headers: {
        type: Array as () => {
          property: string;
          show: boolean;
          width: number;
          title: string;
        }[],
        required: true
      }
    },
    setup() {
      const { t } = useI18n();
      
      // 根据 property 获取翻译后的标题
      const getHeaderTitle = (header: { property: string; title: string }) => {
        const propertyMap: Record<string, string> = {
          'no': 'task.serialNumber',
          'task': 'task.name',
          'priority': 'task.priority',
          'startdate': 'task.startDate',
          'enddate': 'task.endDate',
          'takestime': 'task.duration',
          'progress': 'task.progress',
          'id': 'ID',
          'parentId': 'Parent ID'
        };
        
        const translationKey = propertyMap[header.property];
        if (translationKey) {
          // 如果有翻译键且不是纯字符串，使用翻译
          if (translationKey.includes('.')) {
            return t(translationKey);
          }
          // 否则直接返回（如 ID）
          return translationKey;
        }
        // 如果没有映射，返回原标题
        return header.title;
      };
      
      return {
        getHeaderTitle
      };
    }
  });
  </script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  
  .headerCaption {
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--text-primary, #333333);
    font-size: 14px;
    font-weight: 600;
    box-sizing: border-box;
    letter-spacing: 0.5px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    transition: all var(--transition-fast, 0.15s ease);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-top: 1px solid var(--border, #cecece);
      border-bottom: 1px solid var(--border, #cecece);
      pointer-events: none;
    }
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 0;
      bottom: 0;
      background: var(--border, #cecece);
      border-left: 1px solid var(--border, #cecece);
    }
    
    &:first-child::before {
      border-left: 1px solid var(--border, #cecece);
    }

    &:last-child::before {
      border-right: 1px solid var(--border, #cecece);
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
    }
  }
}
</style>