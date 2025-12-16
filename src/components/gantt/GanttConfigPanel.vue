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

    <transition name="panel-fade">
      <div v-if="isOpen" class="config-panel" @click.stop>
        <div class="panel-header">
          <h3>{{ t('configPanel.title') }}</h3>
          <button class="close-btn" @click="closePanel" :title="t('common.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <!-- 主题配置区域 -->
          <div class="config-section">
            <h4 class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              {{ t('configPanel.themeSettings') }}
            </h4>
            <div class="theme-grid">
              <div
                v-for="theme in themes"
                :key="theme.id"
                class="theme-card"
                :class="{ active: currentTheme === theme.id }"
                @click="selectTheme(theme.id)"
              >
                <div class="theme-preview" :style="{ background: theme.preview }"></div>
                <div class="theme-info">
                  <div class="theme-name">{{ theme.name }}</div>
                  <div class="theme-desc">{{ theme.description }}</div>
                </div>
                <div v-if="currentTheme === theme.id" class="theme-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 连线配置区域 -->
          <div class="config-section">
            <h4 class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 9l6 6 6-6"/>
                <circle cx="4" cy="9" r="2"/>
                <circle cx="20" cy="9" r="2"/>
                <path d="M10 9h4"/>
              </svg>
              {{ t('configPanel.linkSettings') }}
            </h4>
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
                <div class="path-type-grid">
                  <div 
                    v-for="pathType in pathTypes" 
                    :key="pathType.value"
                    class="path-type-card"
                    :class="{ active: linkConfig.pathType === pathType.value }"
                    @click="selectPathType(pathType.value)"
                  >
                    <svg width="50" height="30" viewBox="0 0 60 40">
                      <path 
                        :d="pathType.preview" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        fill="none"
                      />
                    </svg>
                    <span class="path-name">{{ pathType.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 基础样式配置 -->
              <div class="config-group">
                <label class="config-label">颜色</label>
                <input 
                  type="color" 
                  v-model="linkConfig.color" 
                  @change="updateLinkConfig"
                  class="color-input"
                />
              </div>

              <div class="config-group">
                <label class="config-label">{{ t('configPanel.linkConfig.width') }}: {{ linkConfig.width }}px</label>
                <input 
                  type="range" 
                  v-model.number="linkConfig.width" 
                  @input="updateLinkConfig"
                  min="1" 
                  max="5" 
                  step="0.5"
                  class="range-input"
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
                <label class="config-label">弯曲度: {{ linkConfig.bezierCurvature }}</label>
                <input 
                  type="range" 
                  v-model.number="linkConfig.bezierCurvature" 
                  @input="updateLinkConfig"
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  class="range-input"
                />
              </div>

              <!-- 直角连线配置 -->
              <template v-if="linkConfig.pathType === 'right-angle'">
                <div class="config-group">
                  <label class="config-label">偏移距离: {{ linkConfig.rightAngleOffset }}px</label>
                  <input 
                    type="range" 
                    v-model.number="linkConfig.rightAngleOffset" 
                    @input="updateLinkConfig"
                    min="10" 
                    max="80" 
                    step="5"
                    class="range-input"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">
                    <input 
                      type="checkbox" 
                      v-model="linkConfig.smoothCorners" 
                      @change="updateLinkConfig"
                    />
                    平滑转角
                  </label>
                </div>

                <div v-if="linkConfig.smoothCorners" class="config-group">
                  <label class="config-label">转角半径: {{ linkConfig.cornerRadius }}px</label>
                  <input 
                    type="range" 
                    v-model.number="linkConfig.cornerRadius" 
                    @input="updateLinkConfig"
                    min="0" 
                    max="15" 
                    step="1"
                    class="range-input"
                  />
                </div>
              </template>

              <!-- 箭头配置 -->
              <div class="config-group">
                <label class="config-label">
                  <input 
                    type="checkbox" 
                    v-model="linkConfig.showArrow" 
                    @change="updateLinkConfig"
                  />
                  显示箭头
                </label>
              </div>

              <template v-if="linkConfig.showArrow">
                <div class="config-group">
                  <label class="config-label">箭头大小: {{ linkConfig.arrowSize }}px</label>
                  <input 
                    type="range" 
                    v-model.number="linkConfig.arrowSize" 
                    @input="updateLinkConfig"
                    min="4" 
                    max="16" 
                    step="1"
                    class="range-input"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">箭头颜色</label>
                  <div class="color-group">
                    <input 
                      type="color" 
                      v-model="linkConfig.arrowColor" 
                      @change="updateLinkConfig"
                      class="color-input"
                    />
                    <button 
                      @click="linkConfig.arrowColor = linkConfig.color; updateLinkConfig()" 
                      class="sync-btn"
                      title="与线条颜色同步"
                    >
                      同步
                    </button>
                  </div>
                </div>
              </template>

              <!-- 虚线动画 -->
              <div class="config-group">
                <label class="config-label">
                  <input 
                    type="checkbox" 
                    v-model="linkConfig.enableDashAnimation" 
                    @change="updateLinkConfig"
                  />
                  虚线流动动画
                </label>
              </div>

              <div v-if="linkConfig.enableDashAnimation" class="config-group">
                <label class="config-label">动画速度: {{ linkConfig.dashAnimationSpeed }}s</label>
                <input 
                  type="range" 
                  v-model.number="linkConfig.dashAnimationSpeed" 
                  @input="updateLinkConfig"
                  min="0.2" 
                  max="3" 
                  step="0.2"
                  class="range-input"
                />
              </div>

              <!-- 标签配置 -->
              <div class="config-group">
                <label class="config-label">
                  <input 
                    type="checkbox" 
                    v-model="linkConfig.showLabels" 
                    @change="updateLinkConfig"
                  />
                  显示标签
                </label>
              </div>

              <template v-if="linkConfig.showLabels">
                <div class="config-group">
                  <label class="config-label">标签颜色</label>
                  <input 
                    type="color" 
                    v-model="linkConfig.labelColor" 
                    @change="updateLinkConfig"
                    class="color-input"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">字体大小: {{ linkConfig.labelFontSize }}px</label>
                  <input 
                    type="range" 
                    v-model.number="linkConfig.labelFontSize" 
                    @input="updateLinkConfig"
                    min="8" 
                    max="16" 
                    step="1"
                    class="range-input"
                  />
                </div>
              </template>

              <!-- 连线类型颜色配置 -->
              <div class="config-subsection">
                <h5 class="subsection-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                    <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                  </svg>
                  依赖类型颜色
                </h5>
                
                <div class="link-type-colors">
                  <div class="color-item">
                    <div class="color-preview">
                      <svg width="20" height="10" viewBox="0 0 20 10">
                        <line x1="0" y1="5" x2="14" y2="5" :stroke="linkConfig.linkTypeColors.finishToStart" stroke-width="2"/>
                        <polygon :points="'20,5 14,2 14,8'" :fill="linkConfig.linkTypeColors.finishToStart"/>
                      </svg>
                    </div>
                    <span class="color-label">FS</span>
                    <span class="color-desc">完成-开始</span>
                    <input 
                      type="color" 
                      v-model="linkConfig.linkTypeColors.finishToStart" 
                      @change="updateLinkConfig"
                      class="color-input-small"
                    />
                  </div>
                  
                  <div class="color-item">
                    <div class="color-preview">
                      <svg width="20" height="10" viewBox="0 0 20 10">
                        <line x1="0" y1="5" x2="14" y2="5" :stroke="linkConfig.linkTypeColors.startToStart" stroke-width="2"/>
                        <polygon :points="'20,5 14,2 14,8'" :fill="linkConfig.linkTypeColors.startToStart"/>
                      </svg>
                    </div>
                    <span class="color-label">SS</span>
                    <span class="color-desc">开始-开始</span>
                    <input 
                      type="color" 
                      v-model="linkConfig.linkTypeColors.startToStart" 
                      @change="updateLinkConfig"
                      class="color-input-small"
                    />
                  </div>
                  
                  <div class="color-item">
                    <div class="color-preview">
                      <svg width="20" height="10" viewBox="0 0 20 10">
                        <line x1="0" y1="5" x2="14" y2="5" :stroke="linkConfig.linkTypeColors.finishToFinish" stroke-width="2"/>
                        <polygon :points="'20,5 14,2 14,8'" :fill="linkConfig.linkTypeColors.finishToFinish"/>
                      </svg>
                    </div>
                    <span class="color-label">FF</span>
                    <span class="color-desc">完成-完成</span>
                    <input 
                      type="color" 
                      v-model="linkConfig.linkTypeColors.finishToFinish" 
                      @change="updateLinkConfig"
                      class="color-input-small"
                    />
                  </div>
                  
                  <div class="color-item">
                    <div class="color-preview">
                      <svg width="20" height="10" viewBox="0 0 20 10">
                        <line x1="0" y1="5" x2="14" y2="5" :stroke="linkConfig.linkTypeColors.startToFinish" stroke-width="2"/>
                        <polygon :points="'20,5 14,2 14,8'" :fill="linkConfig.linkTypeColors.startToFinish"/>
                      </svg>
                    </div>
                    <span class="color-label">SF</span>
                    <span class="color-desc">开始-完成</span>
                    <input 
                      type="color" 
                      v-model="linkConfig.linkTypeColors.startToFinish" 
                      @change="updateLinkConfig"
                      class="color-input-small"
                    />
                  </div>
                </div>
              </div>

              <!-- 父子关系样式 -->
              <div class="config-subsection">
                <h5 class="subsection-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  父子关系连线样式
                </h5>
                <div class="config-info-box" style="margin-bottom: 12px;">
                  <span style="font-size: 11px;">用于显示父任务与子任务之间的层级结构关系</span>
                </div>
                
                <div class="config-group">
                  <label class="config-label">颜色</label>
                  <input 
                    type="color" 
                    v-model="linkConfig.parentChildStyle.color" 
                    @change="updateLinkConfig"
                    class="color-input"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">线宽: {{ linkConfig.parentChildStyle.width }}px</label>
                  <input 
                    type="range" 
                    v-model.number="linkConfig.parentChildStyle.width" 
                    @input="updateLinkConfig"
                    min="1" 
                    max="3" 
                    step="0.5"
                    class="range-input"
                  />
                </div>

                <div class="config-group">
                  <label class="config-label">虚线样式</label>
                  <select v-model="linkConfig.parentChildStyle.dashArray" @change="updateLinkConfig" class="select-input">
                    <option :value="undefined">实线</option>
                    <option value="3,3">短虚线</option>
                    <option value="5,5">中虚线</option>
                    <option value="8,4">长虚线</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isOpen" class="panel-overlay" @click="closePanel"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, inject, type Ref } from 'vue';
import { ganttThemes, ganttThemeManager, type GanttTheme } from './themes/GanttThemes';
import { useLinkConfig, LinkPathType } from './LinkConfig';
import { useI18n } from './i18n';

export default defineComponent({
  name: 'GanttConfigPanel',
  setup() {
    const { t } = useI18n();
    const isOpen = ref(false);
    const themes = ref<GanttTheme[]>(ganttThemes);
    const currentTheme = ref<string>('metro');
    
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

    const pathTypes = ref([
      { value: LinkPathType.STRAIGHT, name: '直线', preview: 'M 10 20 L 50 20' },
      { value: LinkPathType.BEZIER, name: '贝塞尔', preview: 'M 10 20 C 25 20 35 20 50 20' },
      { value: LinkPathType.RIGHT_ANGLE, name: '直角', preview: 'M 10 20 L 30 20 L 30 30 L 50 30' }
    ]);

    const togglePanel = () => {
      isOpen.value = !isOpen.value;
    };

    const closePanel = () => {
      isOpen.value = false;
    };

    const selectTheme = (themeId: string) => {
      currentTheme.value = themeId;
      ganttThemeManager.setTheme(themeId);
    };

    const selectPathType = (pathType: string) => {
      linkConfig.value.pathType = pathType as LinkPathType;
      updateLinkConfig();
    };

    const updateLinkConfig = () => {
      // 更新到连线配置管理器
      updateLinkConfigManager(linkConfig.value);
      console.log('Link config updated:', linkConfig.value);
    };

    onMounted(() => {
      // 设置甘特图容器到主题管理器
      if (ganttContainer?.value) {
        console.log('GanttConfigPanel: Setting gantt container to theme manager');
        ganttThemeManager.setGanttContainer(ganttContainer.value);
      } else {
        console.warn('GanttConfigPanel: ganttContainer not available');
      }
      
      currentTheme.value = ganttThemeManager.getCurrentTheme();
    });

    // 监听linkConfig的深层变化
    watch(linkConfig, (newConfig) => {
      updateLinkConfigManager(newConfig);
    }, { deep: true });

    return {
      t,
      isOpen,
      themes,
      currentTheme,
      linkConfig,
      pathTypes,
      togglePanel,
      closePanel,
      selectTheme,
      selectPathType,
      updateLinkConfig
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #333333);
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border, #d0d0d0);

    svg {
      color: var(--primary, #0078d4);
    }
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  border: 2px solid var(--border, #d0d0d0);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  position: relative;

  &:hover {
    border-color: var(--primary, #0078d4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    border-color: var(--primary, #0078d4);
    background: var(--bg-active-hover, linear-gradient(145deg, #e3f2fd, #bbdefb));
  }

  .theme-preview {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .theme-info {
    flex: 1;
    min-width: 0;

    .theme-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #333333);
      margin-bottom: 4px;
    }

    .theme-desc {
      font-size: 11px;
      color: var(--text-secondary, #666666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .theme-check {
    color: var(--primary, #0078d4);
    flex-shrink: 0;
  }
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

    .color-input {
      width: 60px;
      height: 36px;
      border: 1px solid var(--border, #d0d0d0);
      cursor: pointer;
      transition: all var(--transition-fast, 0.15s ease);

      &:hover {
        border-color: var(--primary, #0078d4);
      }
    }

    .range-input {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: var(--bg-secondary, #e8e8e8);
      outline: none;
      border-radius: 3px;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: var(--primary, #0078d4);
        cursor: pointer;
        border-radius: 50%;
        transition: all var(--transition-fast, 0.15s ease);

        &:hover {
          transform: scale(1.2);
        }
      }

      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: var(--primary, #0078d4);
        cursor: pointer;
        border-radius: 50%;
        border: none;
        transition: all var(--transition-fast, 0.15s ease);

        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }

  .path-type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .path-type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    border: 2px solid var(--border, #d0d0d0);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s ease);
    color: var(--text-secondary, #666666);

    &:hover {
      border-color: var(--primary, #0078d4);
      color: var(--primary, #0078d4);
    }

    &.active {
      border-color: var(--primary, #0078d4);
      background: var(--bg-active-hover, linear-gradient(145deg, #e3f2fd, #bbdefb));
      color: var(--primary, #0078d4);
    }

    .path-name {
      font-size: 11px;
      font-weight: 600;
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

  .color-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sync-btn {
    padding: 6px 12px;
    font-size: 11px;
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
    border: 1px solid var(--border, #d0d0d0);
    color: var(--text-primary, #333333);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s ease);
    white-space: nowrap;

    &:hover {
      background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
      border-color: var(--primary, #0078d4);
    }

    &:active {
      transform: scale(0.95);
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

  .link-type-colors {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
      border: 1px solid var(--border, #d0d0d0);
      border-radius: 4px;

      .color-preview {
        display: flex;
        align-items: center;
        width: 24px;
      }

      .color-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary, #333333);
        min-width: 20px;
      }

      .color-desc {
        font-size: 11px;
        color: var(--text-secondary, #666666);
        flex: 1;
      }

      .color-input-small {
        width: 28px;
        height: 24px;
        border: 1px solid var(--border, #d0d0d0);
        border-radius: 3px;
        cursor: pointer;
        padding: 0;

        &::-webkit-color-swatch-wrapper {
          padding: 2px;
        }

        &::-webkit-color-swatch {
          border: none;
          border-radius: 2px;
        }
      }
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
