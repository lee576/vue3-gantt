<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="column-config-overlay" 
      @click.self="handleClose"
      :data-gantt-theme="currentTheme"
    >
      <div class="column-config-panel" ref="panelRef" :data-gantt-theme="currentTheme">
        <!-- 标题栏 -->
        <div class="panel-header">
          <h3>{{ t('columnSettings.title') }}</h3>
          <button class="close-btn" @click="handleClose" :title="t('tooltip.close')">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- 描述 -->
        <div class="panel-desc">
          {{ t('columnSettings.desc') }}
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <button class="action-btn" @click="showAll">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
            </svg>
            {{ t('columnSettings.showAll') }}
          </button>
          <button class="action-btn" @click="hideAll">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
            </svg>
            {{ t('columnSettings.hideAll') }}
          </button>
          <button class="action-btn" @click="reset">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
            </svg>
            {{ t('columnSettings.reset') }}
          </button>
        </div>

        <!-- 列配置列表 -->
        <div class="column-list">
          <div 
            v-for="(header, index) in headers" 
            :key="header.property"
            class="column-item"
            :class="{ disabled: !header.show }"
          >
            <label class="checkbox-wrapper">
              <input 
                type="checkbox" 
                :checked="header.show"
                @change="toggleColumn(index)"
              />
              <span class="checkbox-custom"></span>
              <span class="column-label">{{ getHeaderTitle(header) }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from '../i18n';
import { ganttThemeManager } from '../themes/GanttThemes';

interface TaskHeader {
  property: string;
  show: boolean;
  width: number;
  title: string;
}

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    headers: {
      type: Array as PropType<TaskHeader[]>,
      required: true
    }
  },
  emits: ['close', 'update:headers'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const panelRef = ref<HTMLDivElement | null>(null);
    
    // 直接获取当前主题，不依prop
    const currentTheme = ref<string>('metro');
    
    // 将主题CSS变量应用到配置面板
    const applyThemeToPanel = (themeId: string) => {
      if (!panelRef.value) return;
      
      const theme = ganttThemeManager.getThemeInfo(themeId);
      if (!theme) return;
      
      // 设置主题属性
      panelRef.value.setAttribute('data-gantt-theme', themeId);
      
      // 应用CSS变量到配置面板
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        panelRef.value!.style.setProperty(property, value);
      });
    };
    
    // 监听 visible 变化，当面板显示时应用主题
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        // 获取当前主题
        currentTheme.value = ganttThemeManager.getCurrentTheme();
        // 延迟应用主题，确保DOM已渲染
        setTimeout(() => {
          applyThemeToPanel(currentTheme.value);
        }, 0);
      }
    });

    // 根据 property 获取翻译后的标题
    const getHeaderTitle = (header: TaskHeader) => {
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
        if (translationKey.includes('.')) {
          return t(translationKey);
        }
        return translationKey;
      }
      return header.title;
    };

    // 关闭面板
    const handleClose = () => {
      emit('close');
    };

    // 切换列显示/隐藏
    const toggleColumn = (index: number) => {
      const newHeaders = [...props.headers];
      newHeaders[index].show = !newHeaders[index].show;
      emit('update:headers', newHeaders);
    };

    // 显示全部列
    const showAll = () => {
      const newHeaders = props.headers.map(h => ({ ...h, show: true }));
      emit('update:headers', newHeaders);
    };

    // 隐藏全部列
    const hideAll = () => {
      const newHeaders = props.headers.map(h => ({ ...h, show: false }));
      emit('update:headers', newHeaders);
    };

    // 恢复默认配置
    const reset = () => {
      const defaultConfig: Record<string, boolean> = {
        'no': true,
        'task': true,
        'priority': true,
        'startdate': true,
        'enddate': true,
        'takestime': true,
        'progress': true,
        'id': false,
        'parentId': false
      };
      
      const newHeaders = props.headers.map(h => ({
        ...h,
        show: defaultConfig[h.property] !== undefined ? defaultConfig[h.property] : true
      }));
      emit('update:headers', newHeaders);
    };

    return {
      t,
      panelRef,
      currentTheme,
      getHeaderTitle,
      handleClose,
      toggleColumn,
      showAll,
      hideAll,
      reset
    };
  }
});
</script>

<style lang="scss" scoped>
.column-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;

  // Liquid Glass 主题特殊处理
  &[data-gantt-theme="liquidGlass"] {
    backdrop-filter: blur(var(--glass-blur, 12px));
    background: rgba(0, 0, 0, 0.3);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.column-config-panel {
  width: 450px;
  max-width: 90vw;
  max-height: 80vh;
  background: var(--bg-content, #ffffff);
  border-radius: 12px;
  box-shadow: var(--shadow-outset, 0 8px 32px rgba(0, 0, 0, 0.15));
  border: 1px solid var(--border, #d0d0d0);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  font-family: var(--font-family, 'Segoe UI', sans-serif);

  [data-gantt-theme="liquidGlass"] & {
    background: var(--bg-metal-normal, rgba(245, 247, 250, 0.55));
    backdrop-filter: blur(var(--glass-blur, 12px)) saturate(var(--glass-saturation, 180%)) brightness(var(--glass-brightness, 105%));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.4));
    box-shadow: 
      var(--shadow-outset, 0 8px 32px rgba(0, 122, 255, 0.12)),
      inset 0 1px 0 var(--glass-edge-highlight, rgba(255, 255, 255, 0.9)),
      inset 0 -1px 0 var(--glass-edge-shadow, rgba(0, 0, 0, 0.1));
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.panel-header {
  padding: 20px 24px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border-bottom: 1px solid var(--border, #d0d0d0);
  display: flex;
  align-items: center;
  justify-content: space-between;

  [data-gantt-theme="liquidGlass"] & {
    background: var(--bg-metal-light, rgba(255, 255, 255, 0.65));
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.4));
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #333333);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--border, #d0d0d0);
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    color: var(--text-primary, #333333);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast, 0.15s ease);
    box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));

    svg {
      display: block;
      flex-shrink: 0;
    }

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      color: var(--primary, #0078d4);
      border-color: var(--primary, #0078d4);
      transform: scale(1.1);
    }

    &:active {
      background: var(--bg-metal-pressed, linear-gradient(145deg, #e0e0e0, #f8f8f8));
      transform: scale(0.95);
    }

    [data-gantt-theme="liquidGlass"] & {
      background: var(--bg-metal-light, rgba(255, 255, 255, 0.65));
      border: 1px solid var(--border, rgba(255, 255, 255, 0.4));
      color: var(--text-primary, #1d1d1f);
      
      &:hover {
        background: var(--bg-metal-normal, rgba(245, 247, 250, 0.55));
      }
    }
  }
}

.panel-desc {
  padding: 16px 24px;
  color: var(--text-secondary, #666666);
  font-size: 13px;
  line-height: 1.5;
  background: var(--bg-secondary, #f8f8f8);
  border-bottom: 1px solid var(--border, #d0d0d0);

  [data-gantt-theme="liquidGlass"] & {
    background: var(--bg-secondary, rgba(242, 242, 247, 0.75));
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.4));
  }
}

.action-buttons {
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-content, #ffffff);

  [data-gantt-theme="liquidGlass"] & {
    background: var(--bg-content, rgba(255, 255, 255, 0.7));
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.4));
  }

  .action-btn {
    flex: 1;
    padding: 8px 16px;
    border: 1px solid var(--border, #d0d0d0);
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    color: var(--text-primary, #333333);
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all var(--transition-fast, 0.15s ease);
    box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));

    [data-gantt-theme="liquidGlass"] & {
      background: var(--bg-metal-light, rgba(255, 255, 255, 0.65));
      border: 1px solid var(--border, rgba(255, 255, 255, 0.4));
    }

    &:hover {
      background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
      color: var(--text-white, #ffffff);
      border-color: var(--primary, #0078d4);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 120, 212, 0.2);

      [data-gantt-theme="liquidGlass"] & {
        background: var(--bg-active, rgba(0, 122, 255, 0.75));
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-active, inset 0 1px 0 rgba(255, 255, 255, 0.2));
    }

    svg {
      flex-shrink: 0;
    }
  }
}

.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  background: var(--bg-content, #ffffff);

  [data-gantt-theme="liquidGlass"] & {
    background: var(--bg-content, rgba(255, 255, 255, 0.7));
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-dark, #b0b0b0);
    border-radius: 4px;

    &:hover {
      background: var(--text-secondary, #666666);
    }
  }
}

.column-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border, #e0e0e0);
  transition: all var(--transition-fast, 0.15s ease);

  &:last-child {
    border-bottom: none;
  }

  &.disabled {
    opacity: 0.5;
  }

  &:hover {
    background: var(--row-hover, #FFF3A1);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 6px;

    [data-gantt-theme="liquidGlass"] & {
      background: var(--row-hover, rgba(232, 244, 253, 0.6));
    }
  }
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;

    &:checked + .checkbox-custom {
      background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
      border-color: var(--primary, #0078d4);

      [data-gantt-theme="liquidGlass"] & {
        background: var(--bg-active, rgba(0, 122, 255, 0.75));
      }

      &::after {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    &:focus + .checkbox-custom {
      box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.2);
    }
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-dark, #b0b0b0);
    border-radius: 4px;
    background: var(--bg-content, #ffffff);
    margin-right: 12px;
    position: relative;
    flex-shrink: 0;
    transition: all var(--transition-fast, 0.15s ease);
    box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));

    [data-gantt-theme="liquidGlass"] & {
      background: var(--bg-content, rgba(255, 255, 255, 0.7));
      border: 2px solid var(--border, rgba(255, 255, 255, 0.4));
    }

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 16px;
      height: 16px;
      background: var(--text-white, #ffffff);
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='white'/%3E%3C/svg%3E") center/contain no-repeat;
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='white'/%3E%3C/svg%3E") center/contain no-repeat;
      opacity: 0;
      transition: all var(--transition-fast, 0.15s ease);
    }
  }

  .column-label {
    font-size: 14px;
    color: var(--text-primary, #333333);
    font-weight: 500;
  }

  &:hover .checkbox-custom {
    border-color: var(--primary, #0078d4);
  }
}
</style>
