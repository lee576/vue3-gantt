<template>
  <div class="gantt-theme-selector">
    <div class="theme-selector-trigger" @click="toggleSelector" :class="{ active: isOpen }">
      <div class="theme-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
      <span class="theme-text">主题</span>
      <div class="theme-arrow" :class="{ rotated: isOpen }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </div>

    <div class="theme-dropdown" v-show="isOpen" @click.stop>
      <div class="theme-dropdown-header">
        <h3>选择主题</h3>
        <button class="close-btn" @click="closeSelector">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="theme-grid">
        <div 
          v-for="theme in availableThemes" 
          :key="theme.id"
          class="theme-card"
          :class="{ 
            active: currentTheme === theme.id,
            preview: previewTheme === theme.id 
          }"
          @click="selectTheme(theme.id)"
          @mouseenter="onPreviewTheme(theme.id)"
          @mouseleave="onCancelPreview"
        >
          <div class="theme-preview" :style="{ backgroundColor: theme.preview }">
            <div class="theme-preview-content">
              <div class="preview-header" :style="{ backgroundColor: theme.preview }"></div>
              <div class="preview-body">
                <div class="preview-bar"></div>
                <div class="preview-bar short"></div>
                <div class="preview-bar medium"></div>
              </div>
            </div>
          </div>
          <div class="theme-info">
            <h4 class="theme-name">{{ t(theme.nameKey) }}</h4>
            <p class="theme-description">{{ t(theme.descKey) }}</p>
          </div>
          <div class="theme-status">
            <div v-if="currentTheme === theme.id" class="status-badge current">当前</div>
            <div v-else-if="previewTheme === theme.id" class="status-badge preview">预览</div>
          </div>
        </div>
      </div>

      <div class="theme-actions">
        <button class="action-btn" @click="exportConfig">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          导出配置
        </button>
        <button class="action-btn" @click="importConfig">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          导入配置
        </button>
      </div>
    </div>

    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleFileImport"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, inject, watchEffect, nextTick } from 'vue';
import { ganttThemes, ganttThemeManager, type GanttTheme } from '../themes/GanttThemes';
import { useI18n } from '../i18n';

export default defineComponent({
  name: 'GanttThemeSelector',
  setup() {
    const { t } = useI18n();
    const isOpen = ref(false);
    const currentTheme = inject<any>('currentTheme', ref('metro'));
    const previewTheme = ref('');
    const fileInput = ref<HTMLInputElement>();
    const availableThemes = ref<GanttTheme[]>(ganttThemes);

    // 获取甘特图容器引用
    const ganttContainer = inject<any>('ganttContainer');

    const toggleSelector = () => {
      isOpen.value = !isOpen.value;
    };

    const closeSelector = () => {
      isOpen.value = false;
      onCancelPreview();
    };

    const selectTheme = (themeId: string) => {
      currentTheme.value = themeId;
      previewTheme.value = '';
      
      // 先尝试注入样式，不依赖容器引用
      injectThemeStyles(themeId);
      
      // 查找甘特图容器的多种方式
      let container = null;
      
      if (ganttContainer && ganttContainer.value) {
        container = ganttContainer.value;
      } else {
        // 备用方案：直接查找DOM元素
        container = document.querySelector('.gantt-container') || 
                   document.querySelector('.page') ||
                   document.querySelector('[class*="gantt"]');
      }
      
      if (container) {
        // 设置容器属性
        container.setAttribute('data-gantt-theme', themeId);
        
        // 同时设置到页面根元素
        const pageElement = document.querySelector('.page');
        if (pageElement) {
          pageElement.setAttribute('data-gantt-theme', themeId);
        }
        
        // 保存到localStorage
        try {
          localStorage.setItem('gantt-theme', themeId);
        } catch (error) {
          console.warn('Failed to save theme:', error);
        }
        
        // 强制触发重绘
        setTimeout(() => {
          if (container) {
            container.style.display = 'none';
            container.offsetHeight; // 触发重排
            container.style.display = '';
          }
        }, 50);
        
      }
      
      closeSelector();
    };

    const onPreviewTheme = (themeId: string) => {
      if (themeId !== currentTheme.value && ganttContainer && ganttContainer.value) {
        previewTheme.value = themeId;
        
        // 临时注入预览主题
        injectThemeStyles(themeId);
      }
    };

    const onCancelPreview = () => {
      if (previewTheme.value && ganttContainer && ganttContainer.value) {
        previewTheme.value = '';
        
        // 恢复当前主题
        injectThemeStyles(currentTheme.value);
      }
    };

    const exportConfig = () => {
      const config = ganttThemeManager.exportThemeConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gantt-theme-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const importConfig = () => {
      fileInput.value?.click();
    };

    const handleFileImport = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            if (ganttThemeManager.importThemeConfig(content)) {
              currentTheme.value = ganttThemeManager.getCurrentTheme();
              alert('主题配置导入成功！');
            } else {
              alert('主题配置文件格式错误！');
            }
          } catch (error) {
            alert('主题配置文件格式错误！');
          }
        };
        reader.readAsText(file);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.gantt-theme-selector')) {
        closeSelector();
      }
    };

    // 动态注入主题样式 - 增强版
    const injectThemeStyles = (themeId: string) => {
      // 移除之前的主题样式
      const existingStyle = document.getElementById('gantt-theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const theme = ganttThemes.find(t => t.id === themeId);
      if (!theme) {
        return;
      }
      
      // 创建样式元素
      const style = document.createElement('style');
      style.id = 'gantt-theme-styles';
      
      // 生成CSS规则
      const cssRules = Object.entries(theme.cssVariables)
        .map(([property, value]) => `${property}: ${value};`)
        .join('\n    ');
      
      // 创建更强力的CSS内容，使用!important确保优先级
      style.textContent = `
        /* 甘特图主题样式 - ${themeId} */
        .page.gantt-container,
        .page.gantt-container *,
        .gantt-container,
        .gantt-container *,
        [data-gantt-theme="${themeId}"],
        [data-gantt-theme="${themeId}"] *,
        .toolbar,
        .toolbar *,
        .buttonGroup,
        .buttonGroup *,
        .metro-btn,
        .metro-btn *,
        .gantt,
        .gantt * {
          ${cssRules}
        }
        
        /* 根级别变量 */
        :root {
          ${cssRules}
        }
        
        /* 强制应用到特定元素 */
        .page[data-gantt-theme="${themeId}"] .toolbar {
          background: var(--bg-metal-normal) !important;
          border-bottom: 1px solid var(--border) !important;
        }
        
        .page[data-gantt-theme="${themeId}"] .buttonGroup {
          background: var(--bg-metal-normal) !important;
          border: 1px solid var(--border) !important;
        }
        
        .page[data-gantt-theme="${themeId}"] .metro-btn {
          background: var(--bg-metal-normal) !important;
          color: var(--text-secondary) !important;
          border-right: 1px solid var(--border) !important;
        }
        
        .page[data-gantt-theme="${themeId}"] .metro-btn.is-active,
        .page[data-gantt-theme="${themeId}"] .metro-btn.button.is-active {
          background: var(--bg-active) !important;
          color: var(--text-white) !important;
        }
      `;
      
      document.head.appendChild(style);
      console.log('✅ Theme styles injected successfully');
      console.log('📊 Injected CSS length:', style.textContent.length, 'characters');
      
      // 验证样式是否正确注入
      const injectedStyle = document.getElementById('gantt-theme-styles');
      if (injectedStyle) {
        console.log('✅ Style element found in DOM');
      } else {
        console.error('❌ Style element not found in DOM');
      }
    };

    // 初始化主题 - 增强版
    const initTheme = () => {
      console.log('🚀 initTheme called');
      console.log('📦 ganttContainer:', ganttContainer);
      console.log('📦 ganttContainer.value:', ganttContainer?.value);
      
      // 从localStorage加载保存的主题
      try {
        const savedTheme = localStorage.getItem('gantt-theme');
        if (savedTheme && ganttThemes.find(t => t.id === savedTheme)) {
          currentTheme.value = savedTheme;
          console.log('💾 Loaded theme from localStorage:', savedTheme);
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
      }
      
      console.log('🎨 Current theme:', currentTheme.value);
      
      // 先注入样式
      injectThemeStyles(currentTheme.value);
      
      // 查找并设置容器属性
      let container = null;
      
      if (ganttContainer && ganttContainer.value) {
        container = ganttContainer.value;
        console.log('✅ Using injected container reference');
      } else {
        // 备用方案：直接查找DOM元素
        container = document.querySelector('.gantt-container') || 
                   document.querySelector('.page') ||
                   document.querySelector('[class*="gantt"]');
        console.log('🔍 Using DOM query fallback, found:', container);
      }
      
      if (container) {
        container.setAttribute('data-gantt-theme', currentTheme.value);
        console.log('✅ Container attribute set to:', currentTheme.value);
        
        // 同时设置到页面根元素
        const pageElement = document.querySelector('.page');
        if (pageElement) {
          pageElement.setAttribute('data-gantt-theme', currentTheme.value);
          console.log('✅ Page element attribute set');
        }
      } else {
        console.warn('⚠️ No container found during initialization');
        // 延迟重试
        setTimeout(() => {
          console.log('🔄 Retrying theme initialization...');
          initTheme();
        }, 500);
      }
      
      console.log('✅ Theme initialization completed');
    };

    // 使用watchEffect监听容器变化
    watchEffect(() => {
      if (ganttContainer && ganttContainer.value) {
        nextTick(() => {
          initTheme();
        });
      }
    });

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      // 如果容器还没准备好，延迟初始化
      if (!ganttContainer || !ganttContainer.value) {
        setTimeout(() => {
          initTheme();
        }, 200);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      onCancelPreview();
    });

    return {
      t,
      availableThemes,
      isOpen,
      currentTheme,
      previewTheme,
      fileInput,
      toggleSelector,
      closeSelector,
      selectTheme,
      onPreviewTheme,
      onCancelPreview,
      exportConfig,
      importConfig,
      handleFileImport
    };
  }
});
</script>

<style scoped>
.gantt-theme-selector {
  position: relative;
  display: inline-block;
}

.theme-selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8)), var(--shadow-outset, 0 2px 4px rgba(0, 0, 0, 0.1));
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  font-family: var(--font-family, 'Segoe UI', sans-serif);
  font-size: var(--font-size-base, 12px);
  font-weight: var(--font-weight-bold, 600);
  color: var(--text-secondary, #666666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-selector-trigger:hover {
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  color: var(--text-primary, #333333);
}

.theme-selector-trigger.active {
  background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
  color: var(--text-white, #ffffff);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast, 0.15s ease);
}

.theme-arrow.rotated {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  width: 480px;
  max-height: 600px;
  background: var(--bg-content, #ffffff);
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: var(--shadow-outset, 0 2px 4px rgba(0, 0, 0, 0.1)), 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-top: 4px;
}

.theme-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.theme-dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: var(--font-weight-bold, 600);
  color: var(--text-primary, #333333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  color: var(--text-secondary, #666666);
}

.close-btn:hover {
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  color: var(--text-primary, #333333);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.theme-card {
  position: relative;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal, 0.25s ease);
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-card.active {
  border-color: var(--primary, #0078d4);
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.theme-card.preview {
  border-color: var(--secondary, #0d5aa7);
  box-shadow: 0 0 0 2px rgba(13, 90, 167, 0.2);
}

.theme-preview {
  height: 80px;
  position: relative;
  overflow: hidden;
}

.theme-preview-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 20px;
  opacity: 0.9;
}

.preview-body {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.preview-bar.short {
  width: 60%;
}

.preview-bar.medium {
  width: 80%;
}

.theme-info {
  padding: 12px;
}

.theme-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: var(--font-weight-bold, 600);
  color: var(--text-primary, #333333);
}

.theme-description {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary, #666666);
  line-height: 1.4;
}

.theme-status {
  position: absolute;
  top: 8px;
  right: 8px;
}

.status-badge {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: var(--font-weight-bold, 600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 10px;
}

.status-badge.current {
  background: var(--primary, #0078d4);
  color: var(--text-white, #ffffff);
}

.status-badge.preview {
  background: var(--secondary, #0d5aa7);
  color: var(--text-white, #ffffff);
}

.theme-actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: var(--bg-secondary, #e8e8e8);
  border-top: 1px solid var(--border, #d0d0d0);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border: 1px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  font-family: var(--font-family, 'Segoe UI', sans-serif);
  font-size: 11px;
  font-weight: var(--font-weight-bold, 600);
  color: var(--text-secondary, #666666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  color: var(--text-primary, #333333);
}

/* 滚动条样式 */
.theme-grid::-webkit-scrollbar {
  width: 8px;
}

.theme-grid::-webkit-scrollbar-track {
  background: var(--bg-secondary, #e8e8e8);
}

.theme-grid::-webkit-scrollbar-thumb {
  background: var(--border, #d0d0d0);
  border-radius: 4px;
}

.theme-grid::-webkit-scrollbar-thumb:hover {
  background: var(--primary, #0078d4);
}
</style>