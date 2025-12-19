<template>
  <div class="config-panel-wrapper">
    <button 
      class="config-btn" 
      @click="togglePanel"
      :class="{ active: isOpen }"
      :title="t('configPanel.title')"
    >
      <div class="btn-content">
        <div class="btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </div>
        <span class="btn-text">{{ t('common.config') }}</span>
      </div>
    </button>

    <!-- 使用 Teleport 传送到 body 避免被父容器 overflow:hidden 裁剪 -->
    <Teleport to="body">
      <!-- 遮罩层不响应点击，只能通过关闭按钮关闭对话框 -->
      <div v-if="isOpen" class="panel-overlay" :data-gantt-theme="currentTheme"></div>
      
      <div v-if="isOpen" class="config-panel" ref="configPanelRef" :data-gantt-theme="currentTheme">
        <div class="panel-header">
          <h3>{{ t('configPanel.title') }}</h3>
          <button class="close-btn" @click="closePanel" :title="t('common.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <!-- 语言配置区域 -->
          <ConfigSection :title="t('configPanel.languageSettings')" icon="language">
            <LanguageSelector v-model="currentLocale" :locales="locales" @update:modelValue="selectLocale" />
          </ConfigSection>

          <!-- 主题配置区域 -->
          <ConfigSection :title="t('configPanel.themeSettings')" icon="theme">
            <ThemeSelector v-model="currentTheme" :themes="themes" @update:modelValue="selectTheme" />
          </ConfigSection>

          <!-- 连线配置区域 -->
          <ConfigSection :title="t('configPanel.linkSettings')" icon="link">
            <div class="link-config-content">
              <!-- 说明文字 -->
              <div class="config-info-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{{ t('configPanel.linkConfig.info') }}</span>
              </div>

              <!-- 路径类型选择 -->
              <div class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.pathType') }}</label>
                <PathTypeSelector v-model="linkConfig.pathType" @update:modelValue="updateLinkConfig" />
              </div>

              <!-- 基础样式配置 -->
              <div class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.color') }}</label>
                <ColorInput v-model="linkConfig.color" @change="updateLinkConfig" />
              </div>

              <div class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.width') }}: {{ linkConfig.width }}px</label>
                <SliderInput
                  v-model="linkConfig.width"
                  :min="1"
                  :max="5"
                  :step="0.5"
                  :label-step="1"
                  @change="updateLinkConfig"
                />
              </div>

              <div class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.dashStyle') }}</label>
                <select v-model="linkConfig.dashArray" @change="updateLinkConfig" class="select-input">
                  <option :value="undefined">{{ t('configPanel.linkConfig.solid') }}</option>
                  <option value="3,3">{{ t('configPanel.linkConfig.shortDash') }}</option>
                  <option value="5,5">{{ t('configPanel.linkConfig.mediumDash') }}</option>
                  <option value="8,4">{{ t('configPanel.linkConfig.longDash') }}</option>
                  <option value="2,2,8,2">{{ t('configPanel.linkConfig.dotDash') }}</option>
                </select>
              </div>

              <!-- 贝塞尔曲线配置 -->
              <div v-if="linkConfig.pathType === 'bezier'" class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.curvature') }}: {{ linkConfig.bezierCurvature }}</label>
                <SliderInput
                  v-model="linkConfig.bezierCurvature"
                  :min="0.1"
                  :max="1"
                  :step="0.1"
                  :label-step="0.3"
                  @change="updateLinkConfig"
                />
              </div>

              <!-- 直角连线配置 -->
              <template v-if="linkConfig.pathType === 'right-angle'">
                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.offset') }}: {{ linkConfig.rightAngleOffset }}px</label>
                  <SliderInput
                    v-model="linkConfig.rightAngleOffset"
                    :min="10"
                    :max="80"
                    :step="5"
                    :label-step="20"
                    @change="updateLinkConfig"
                  />
                </div>

                <CheckboxConfig
                  v-model="linkConfig.smoothCorners"
                  :label="t('configPanel.linkConfig.smoothCorners')"
                  @change="updateLinkConfig"
                />

                <div v-if="linkConfig.smoothCorners" class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.cornerRadius') }}: {{ linkConfig.cornerRadius }}px</label>
                  <SliderInput
                    v-model="linkConfig.cornerRadius"
                    :min="0"
                    :max="15"
                    :step="1"
                    :label-step="5"
                    @change="updateLinkConfig"
                  />
                </div>
              </template>

              <!-- 箭头配置 -->
              <CheckboxConfig
                v-model="linkConfig.showArrow"
                :label="t('configPanel.linkConfig.showArrow')"
                @change="updateLinkConfig"
              />

              <template v-if="linkConfig.showArrow">
                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.arrowSize') }}: {{ linkConfig.arrowSize }}px</label>
                  <SliderInput
                    v-model="linkConfig.arrowSize"
                    :min="4"
                    :max="16"
                    :step="1"
                    :label-step="4"
                    @change="updateLinkConfig"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.arrowColor') }}</label>
                  <ColorInput
                    v-model="linkConfig.arrowColor"
                    :show-sync="true"
                    :sync-label="t('configPanel.linkConfig.syncColor')"
                    :sync-title="t('tooltip.syncArrowColor')"
                    @change="updateLinkConfig"
                    @sync="linkConfig.arrowColor = linkConfig.color; updateLinkConfig()"
                  />
                </div>
              </template>

              <!-- 虚线动画 -->
              <CheckboxConfig
                v-model="linkConfig.enableDashAnimation"
                :label="t('configPanel.linkConfig.dashAnimation')"
                @change="updateLinkConfig"
              />

              <div v-if="linkConfig.enableDashAnimation" class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.animationSpeed') }}: {{ linkConfig.dashAnimationSpeed }}s</label>
                <SliderInput
                  v-model="linkConfig.dashAnimationSpeed"
                  :min="0.2"
                  :max="3"
                  :step="0.2"
                  :label-step="1"
                  @change="updateLinkConfig"
                />
              </div>

              <!-- 标签配置 -->
              <CheckboxConfig
                v-model="linkConfig.showLabels"
                :label="t('configPanel.linkConfig.showLabels')"
                @change="updateLinkConfig"
              />

              <template v-if="linkConfig.showLabels">
                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.labelColor') }}</label>
                  <ColorInput v-model="linkConfig.labelColor" @change="updateLinkConfig" />
                </div>

                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.fontSize') }}: {{ linkConfig.labelFontSize }}px</label>
                  <SliderInput
                    v-model="linkConfig.labelFontSize"
                    :min="8"
                    :max="16"
                    :step="1"
                    :label-step="2"
                    @change="updateLinkConfig"
                  />
                </div>
              </template>

              <!-- 连线类型颜色配置 -->
              <div class="config-subsection">
                <h5 class="subsection-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                    <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                  </svg>
                  {{ t('configPanel.linkConfig.typeColors') }}
                </h5>
                
                <LinkTypeColorConfig
                  :colors="linkConfig.linkTypeColors"
                  @update:colors="linkConfig.linkTypeColors = $event"
                  @change="updateLinkConfig"
                />
              </div>

              <!-- 父子关系样式 -->
              <div class="config-subsection">
                <h5 class="subsection-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {{ t('configPanel.linkConfig.parentChildStyle') }}
                </h5>
                <div class="config-info-box" style="margin-bottom: 12px;">
                  <span style="font-size: 11px;">{{ t('configPanel.linkConfig.parentChildInfo') }}</span>
                </div>
                
                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.color') }}</label>
                  <ColorInput v-model="linkConfig.parentChildStyle.color" @change="updateLinkConfig" />
                </div>

                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.width') }}: {{ linkConfig.parentChildStyle.width }}px</label>
                  <SliderInput
                    v-model="linkConfig.parentChildStyle.width"
                    :min="1"
                    :max="3"
                    :step="0.5"
                    :label-step="1"
                    @change="updateLinkConfig"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">{{ t('configPanel.linkConfig.dashStyle') }}</label>
                  <select v-model="linkConfig.parentChildStyle.dashArray" @change="updateLinkConfig" class="select-input">
                    <option :value="undefined">{{ t('configPanel.linkConfig.solid') }}</option>
                    <option value="3,3">{{ t('configPanel.linkConfig.shortDash') }}</option>
                    <option value="5,5">{{ t('configPanel.linkConfig.mediumDash') }}</option>
                    <option value="8,4">{{ t('configPanel.linkConfig.longDash') }}</option>
                  </select>
                </div>
              </div>
            </div>
          </ConfigSection>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, computed, type Ref } from 'vue';
import { ganttThemes, ganttThemeManager, type GanttTheme } from '../themes/GanttThemes';
import { useLinkConfig, LinkPathType } from '../composables/LinkConfig';
import { useI18n, type Locale } from '../i18n';
import SliderInput from './SliderInput.vue';
import ConfigSection from './ConfigSection.vue';
import PathTypeSelector from './PathTypeSelector.vue';
import LinkTypeColorConfig from './LinkTypeColorConfig.vue';
import ThemeSelector from './ThemeSelector.vue';
import LanguageSelector from './LanguageSelector.vue';
import ColorInput from './ColorInput.vue';
import CheckboxConfig from './CheckboxConfig.vue';

export default defineComponent({
  name: 'GanttConfigPanel',
  components: {
    SliderInput,
    ConfigSection,
    PathTypeSelector,
    LinkTypeColorConfig,
    ThemeSelector,
    LanguageSelector,
    ColorInput,
    CheckboxConfig
  },
  setup() {
    const { t, locale, setLocale, getLocales } = useI18n();
    const isOpen = ref(false);
    const themes = ref<GanttTheme[]>(ganttThemes);
    const currentTheme = ref<string>('metro');
    const configPanelRef = ref<HTMLDivElement | null>(null);
    
    // 语言选择器相关
    const currentLocale = computed(() => locale.value);
    const locales = computed(() => getLocales());
    
    const selectLocale = (localeValue: Locale) => {
      setLocale(localeValue);
    };
    
    // 注入甘特图容器引用
    const ganttContainer = inject<Ref<HTMLElement | undefined>>('ganttContainer');

    // 使用连线配置管理器
    const { config: linkConfigManager, updateConfig: updateLinkConfigManager } = useLinkConfig();

    // 连线配置 - 从管理器初始化
    const linkConfig = ref({
      pathType: linkConfigManager.pathType || LinkPathType.BEZIER,
      color: linkConfigManager.color || '#3498db',
      width: linkConfigManager.width || 2,
      dashArray: linkConfigManager.dashArray,
      bezierCurvature: linkConfigManager.bezierCurvature || 0.5,
      rightAngleOffset: linkConfigManager.rightAngleOffset || 40,
      smoothCorners: linkConfigManager.smoothCorners || false,
      cornerRadius: linkConfigManager.cornerRadius || 5,
      showArrow: linkConfigManager.showArrow !== undefined ? linkConfigManager.showArrow : true,
      arrowSize: linkConfigManager.arrowSize || 8,
      arrowColor: linkConfigManager.arrowColor || '#3498db',
      enableDashAnimation: linkConfigManager.enableDashAnimation || false,
      dashAnimationSpeed: linkConfigManager.dashAnimationSpeed || 1,
      showLabels: linkConfigManager.showLabels || false,
      labelColor: linkConfigManager.labelColor || '#333333',
      labelFontSize: linkConfigManager.labelFontSize || 12,
      parentChildStyle: {
        color: linkConfigManager.parentChildStyle?.color || '#999999',
        width: linkConfigManager.parentChildStyle?.width || 1.5,
        dashArray: linkConfigManager.parentChildStyle?.dashArray || '3,3'
      },
      linkTypeColors: {
        finishToStart: linkConfigManager.linkTypeColors?.finishToStart || '#3498db',
        startToStart: linkConfigManager.linkTypeColors?.startToStart || '#2ecc71',
        finishToFinish: linkConfigManager.linkTypeColors?.finishToFinish || '#e74c3c',
        startToFinish: linkConfigManager.linkTypeColors?.startToFinish || '#f39c12'
      },
      linkTypeVisibility: {
        finishToStart: linkConfigManager.linkTypeVisibility?.finishToStart ?? true,
        startToStart: linkConfigManager.linkTypeVisibility?.startToStart ?? true,
        finishToFinish: linkConfigManager.linkTypeVisibility?.finishToFinish ?? true,
        startToFinish: linkConfigManager.linkTypeVisibility?.startToFinish ?? true,
        parentChild: linkConfigManager.linkTypeVisibility?.parentChild ?? true
      }
    });

    const togglePanel = () => {
      isOpen.value = !isOpen.value;
      // 打开面板时设置主题属性和CSS变量
      if (isOpen.value) {
        setTimeout(() => {
          applyThemeToPanel(currentTheme.value);
        }, 0);
      }
    };

    const closePanel = () => {
      isOpen.value = false;
    };

    // 将主题CSS变量应用到配置面板
    const applyThemeToPanel = (themeId: string) => {
      if (!configPanelRef.value) return;
      
      const theme = ganttThemeManager.getThemeInfo(themeId);
      if (!theme) return;
      
      // 设置主题属性
      configPanelRef.value.setAttribute('data-gantt-theme', themeId);
      
      // 应用CSS变量到配置面板
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        configPanelRef.value!.style.setProperty(property, value);
      });
    };

    const selectTheme = (themeId: string) => {
      currentTheme.value = themeId;
      ganttThemeManager.setTheme(themeId);
      // 立即更新配置面板的主题属性和CSS变量
      applyThemeToPanel(themeId);
    };

    const updateLinkConfig = () => {
      // 更新到连线配置管理器
      updateLinkConfigManager(linkConfig.value);
    };

    onMounted(() => {
      // 设置甘特图容器到主题管理器
      if (ganttContainer?.value) {
        ganttThemeManager.setGanttContainer(ganttContainer.value);
      } else {
        console.warn('GanttConfigPanel: ganttContainer not available');
      }
      
      currentTheme.value = ganttThemeManager.getCurrentTheme();
    });

    // 注意：移除了 linkConfig 的 deep watch，改用显式调用 updateLinkConfig

    return {
      t,
      isOpen,
      themes,
      currentTheme,
      linkConfig,
      currentLocale,
      locales,
      togglePanel,
      closePanel,
      selectTheme,
      selectLocale,
      updateLinkConfig,
      configPanelRef
    };
  }
});
</script>

<style lang="scss" scoped>
.config-panel-wrapper {
  position: relative;
}

.config-btn {
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));
  padding: 8px 16px;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  font-family: var(--font-family);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  }

  &:active, &.active {
    background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));
    
    .btn-icon, .btn-text {
      color: var(--text-white, #ffffff);
    }
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-icon {
    color: var(--text-secondary, #666666);
    display: flex;
    align-items: center;
    transition: color var(--transition-fast, 0.15s ease);
  }

  .btn-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #333333);
    transition: color var(--transition-fast, 0.15s ease);
  }
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.config-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  background: var(--bg-content, #ffffff);
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border-bottom: 1px solid var(--border, #d0d0d0);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #333333);
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-secondary, #666666);
    transition: all var(--transition-fast, 0.15s ease);
    display: flex;
    align-items: center;

    &:hover {
      color: var(--primary, #0078d4);
      transform: scale(1.1);
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  /* 使用多列布局实现瀑布流效果 */
  column-count: 2;
  column-gap: 24px;
}

.link-config-content {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .config-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .config-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #333333);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .select-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border, #d0d0d0);
    background: var(--bg-content, #ffffff);
    color: var(--text-primary, #333333);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s ease);

    &:hover {
      border-color: var(--primary, #0078d4);
    }

    &:focus {
      outline: none;
      border-color: var(--primary, #0078d4);
      box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.1);
    }
  }

  .config-subsection {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border, #d0d0d0);

    .subsection-title {
      margin: 0 0 12px 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #666666);
      display: flex;
      align-items: center;
    }
  }

  .config-info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-secondary, #f8f9fa);
    border-left: 3px solid var(--primary, #0078d4);
    font-size: 11px;
    color: var(--text-secondary, #666666);
    line-height: 1.4;
    margin-bottom: 16px;

    svg {
      margin-top: 1px;
      color: var(--primary, #0078d4);
    }
  }
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}
</style>

<!-- 非 scoped 样式 - 用于 Teleport 到 body 的配置面板 -->
<style lang="scss">
/* Teleport 到 body 的配置面板样式 - 非 LiquidGlass 主题使用 */
/* 注意：LiquidGlass 主题的样式在 LiquidGlass.css 中定义 */

/* 遮罩层 - 非 LiquidGlass 主题 */
.panel-overlay:not([data-gantt-theme="liquidGlass"]) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* 标准遮罩，不透明度 50% */
  z-index: 100000;
}

/* 配置面板 - 非 LiquidGlass 主题，使用CSS变量支持主题切换 */
.config-panel:not([data-gantt-theme="liquidGlass"]) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  z-index: 100001;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family);
  border-radius: 8px;
}

/* 配置面板头部 - 非 LiquidGlass 主题 */
.config-panel:not([data-gantt-theme="liquidGlass"]) .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border-bottom: 1px solid var(--border, #d0d0d0);
  border-radius: 8px 8px 0 0;
}

.config-panel:not([data-gantt-theme="liquidGlass"]) .panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #333333);
}

.config-panel:not([data-gantt-theme="liquidGlass"]) .panel-header .close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-secondary, #666666);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
}

.config-panel:not([data-gantt-theme="liquidGlass"]) .panel-header .close-btn:hover {
  color: var(--primary, #0078d4);
  transform: scale(1.1);
}

/* 配置面板内容 - 非 LiquidGlass 主题 */
.config-panel:not([data-gantt-theme="liquidGlass"]) .panel-content {
  background: var(--bg-content, #ffffff); /* 使用CSS变量支持主题切换 */
}
</style>
