<template>
  <div class="link-config-panel">
    <div class="panel-header">
      <h3>连线配置</h3>
      <button class="close-btn" @click="$emit('close')" title="关闭">×</button>
    </div>
    
    <div class="panel-content">
      <!-- 路径类型选择 -->
      <div class="config-section">
        <h4>路径类型</h4>
        <div class="path-type-selector">
          <label 
            v-for="pathType in pathTypes" 
            :key="pathType.value"
            class="path-type-option"
            :class="{ active: config.pathType === pathType.value }"
          >
            <input 
              type="radio" 
              :value="pathType.value" 
              v-model="config.pathType"
              @change="updateConfig"
            />
            <div class="path-preview">
              <svg width="60" height="40" viewBox="0 0 60 40">
                <path 
                  :d="pathType.preview" 
                  stroke="#3498db" 
                  stroke-width="2" 
                  fill="none"
                />
              </svg>
            </div>
            <span>{{ pathType.name }}</span>
          </label>
        </div>
      </div>
      
      <!-- 基础样式配置 -->
      <div class="config-section">
        <h4>基础样式</h4>
        <div class="config-row">
          <label>颜色:</label>
          <input 
            type="color" 
            v-model="config.color" 
            @change="updateConfig"
            class="color-input"
          />
        </div>
        
        <div class="config-row">
          <label>线宽:</label>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="0.5"
            v-model.number="config.width" 
            @input="updateConfig"
            class="range-input"
          />
          <span class="value">{{ config.width }}px</span>
        </div>
        
        <div class="config-row">
          <label>虚线样式:</label>
          <select v-model="config.dashArray" @change="updateConfig" class="select-input">
            <option :value="undefined">实线</option>
            <option value="3,3">短虚线</option>
            <option value="5,5">中虚线</option>
            <option value="8,4">长虚线</option>
            <option value="2,2,8,2">点划线</option>
          </select>
        </div>
      </div>
      
      <!-- 路径特定配置 -->
      <div class="config-section" v-if="config.pathType === 'bezier'">
        <h4>贝塞尔曲线配置</h4>
        <div class="config-row">
          <label>弯曲度:</label>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1"
            v-model.number="config.bezierCurvature" 
            @input="updateConfig"
            class="range-input"
          />
          <span class="value">{{ config.bezierCurvature }}</span>
        </div>
      </div>
      
      <div class="config-section" v-if="config.pathType === 'right-angle'">
        <h4>直角连线配置</h4>
        <div class="config-row">
          <label>偏移距离:</label>
          <input 
            type="range" 
            min="10" 
            max="80" 
            step="5"
            v-model.number="config.rightAngleOffset" 
            @input="updateConfig"
            class="range-input"
          />
          <span class="value">{{ config.rightAngleOffset }}px</span>
        </div>
        
        <div class="config-row">
          <label>
            <input 
              type="checkbox" 
              v-model="config.smoothCorners" 
              @change="updateConfig"
            />
            平滑转角
          </label>
        </div>
        
        <div class="config-row" v-if="config.smoothCorners">
          <label>转角半径:</label>
          <input 
            type="range" 
            min="0" 
            max="15" 
            step="1"
            v-model.number="config.cornerRadius" 
            @input="updateConfig"
            class="range-input"
          />
          <span class="value">{{ config.cornerRadius }}px</span>
        </div>
      </div>
      
      <!-- 箭头配置 -->
      <div class="config-section">
        <h4>箭头配置</h4>
        <div class="config-row">
          <label>
            <input 
              type="checkbox" 
              v-model="config.showArrow" 
              @change="updateConfig"
            />
            显示箭头
          </label>
        </div>
        
        <div v-if="config.showArrow">
          <div class="config-row">
            <label>箭头大小:</label>
            <input 
              type="range" 
              min="4" 
              max="16" 
              step="1"
              v-model.number="config.arrowSize" 
              @input="updateConfig"
              class="range-input"
            />
            <span class="value">{{ config.arrowSize }}px</span>
          </div>
          
          <div class="config-row">
            <label>箭头颜色:</label>
            <input 
              type="color" 
              v-model="config.arrowColor" 
              @change="updateConfig"
              class="color-input"
              :placeholder="config.color"
            />
            <button 
              @click="config.arrowColor = config.color; updateConfig()" 
              class="sync-btn"
              title="与线条颜色同步"
            >
              同步
            </button>
          </div>
        </div>
      </div>
      
      <!-- 虚线动画配置 -->
      <div class="config-section">
        <h4>虚线动画</h4>
        <div class="config-row">
          <label>
            <input 
              type="checkbox" 
              v-model="config.enableDashAnimation" 
              @change="updateConfig"
            />
            启用虚线流动动画
          </label>
        </div>
        
        <div v-if="config.enableDashAnimation">
          <div class="config-row">
            <label>动画速度:</label>
            <input 
              type="range" 
              min="0.2" 
              max="3" 
              step="0.2"
              v-model.number="config.dashAnimationSpeed" 
              @input="updateConfig"
              class="range-input"
            />
            <span class="value">{{ config.dashAnimationSpeed }}s</span>
          </div>
          
          <div class="config-info">
            <small>💡 虚线动画只在连线设置为虚线样式时显示</small>
          </div>
        </div>
      </div>
      
      <!-- 标签配置 -->
      <div class="config-section">
        <h4>标签配置</h4>
        <div class="config-row">
          <label>
            <input 
              type="checkbox" 
              v-model="config.showLabels" 
              @change="updateConfig"
            />
            显示标签
          </label>
        </div>
        
        <div v-if="config.showLabels">
          <div class="config-row">
            <label>标签颜色:</label>
            <input 
              type="color" 
              v-model="config.labelColor" 
              @change="updateConfig"
              class="color-input"
            />
          </div>
          
          <div class="config-row">
            <label>字体大小:</label>
            <input 
              type="range" 
              min="8" 
              max="16" 
              step="1"
              v-model.number="config.labelFontSize" 
              @input="updateConfig"
              class="range-input"
            />
            <span class="value">{{ config.labelFontSize }}px</span>
          </div>
        </div>
      </div>
      
      <!-- 父子关系样式 -->
      <div class="config-section">
        <h4>父子关系样式</h4>
        <div class="config-row">
          <label>颜色:</label>
          <input 
            type="color" 
            v-model="config.parentChildStyle.color" 
            @change="updateConfig"
            class="color-input"
          />
        </div>
        
        <div class="config-row">
          <label>线宽:</label>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.5"
            v-model.number="config.parentChildStyle.width" 
            @input="updateConfig"
            class="range-input"
          />
          <span class="value">{{ config.parentChildStyle.width }}px</span>
        </div>
        
        <div class="config-row">
          <label>虚线样式:</label>
          <select v-model="config.parentChildStyle.dashArray" @change="updateConfig" class="select-input">
            <option :value="undefined">实线</option>
            <option value="3,3">短虚线</option>
            <option value="5,5">中虚线</option>
            <option value="8,4">长虚线</option>
          </select>
        </div>
      </div>
      
      <!-- 预设主题 -->
      <div class="config-section">
        <h4>预设主题</h4>
        <div class="theme-selector">
          <button 
            v-for="(_theme, name) in themes" 
            :key="name"
            @click="applyTheme(name)"
            class="theme-btn"
            :class="{ active: isCurrentTheme(name) }"
          >
            {{ getThemeName(name) }}
          </button>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="config-section">
        <div class="action-buttons">
          <button @click="resetConfig" class="reset-btn">重置为默认</button>
          <button @click="exportConfig" class="export-btn">导出配置</button>
          <button @click="showImportDialog = true" class="import-btn">导入配置</button>
        </div>
      </div>
    </div>
    
    <!-- 导入配置对话框 -->
    <div v-if="showImportDialog" class="import-dialog-overlay" @click="showImportDialog = false">
      <div class="import-dialog" @click.stop>
        <h4>导入配置</h4>
        <textarea 
          v-model="importText" 
          placeholder="粘贴配置JSON..."
          class="import-textarea"
        ></textarea>
        <div class="import-actions">
          <button @click="importConfig" class="confirm-btn">导入</button>
          <button @click="showImportDialog = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LinkPathType, LinkThemes, useLinkConfig } from '../composables/LinkConfig';

export default defineComponent({
  name: 'LinkConfigPanel',
  emits: ['close', 'configChange'],
  setup(_, { emit }) {
    const { 
      config, 
      setTheme, 
      updateConfig: updateLinkConfig, 
      reset, 
      exportConfig: exportLinkConfig, 
      importConfig: importLinkConfig,
      themes 
    } = useLinkConfig();
    
    const showImportDialog = ref(false);
    const importText = ref('');
    
    // 路径类型选项
    const pathTypes = [
      {
        value: LinkPathType.STRAIGHT,
        name: '直线',
        preview: 'M 10 20 L 50 20'
      },
      {
        value: LinkPathType.BEZIER,
        name: '贝塞尔曲线',
        preview: 'M 10 20 C 25 20 35 20 50 20'
      },
      {
        value: LinkPathType.RIGHT_ANGLE,
        name: '直角连线',
        preview: 'M 10 20 L 30 20 L 30 30 L 50 30'
      }
    ];
    
    // 主题名称映射
    const themeNames = {
      default: '默认',
      business: '商务',
      modern: '现代',
      minimal: '简约',
      colorful: '彩色'
    };
    
    const getThemeName = (name: string) => {
      return themeNames[name as keyof typeof themeNames] || name;
    };
    
    // 检查是否为当前主题
    const isCurrentTheme = (themeName: string) => {
      const theme = themes[themeName as keyof typeof themes];
      if (!theme) return false;
      
      return Object.keys(theme).every(key => {
        const themeValue = theme[key as keyof typeof theme];
        const configValue = config[key as keyof typeof config];
        
        if (typeof themeValue === 'object' && typeof configValue === 'object') {
          return JSON.stringify(themeValue) === JSON.stringify(configValue);
        }
        
        return themeValue === configValue;
      });
    };
    
    // 更新配置
    const updateConfig = () => {
      updateLinkConfig(config);
      emit('configChange', config);
    };
    
    // 应用主题
    const applyTheme = (themeName: string) => {
      setTheme(themeName as keyof typeof LinkThemes);
      emit('configChange', config);
    };
    
    // 重置配置
    const resetConfig = () => {
      reset();
      emit('configChange', config);
    };
    
    // 导出配置
    const exportConfig = () => {
      const configJson = exportLinkConfig();
      navigator.clipboard.writeText(configJson).then(() => {
        alert('配置已复制到剪贴板');
      }).catch(() => {
        // 降级方案：显示配置内容
        const textarea = document.createElement('textarea');
        textarea.value = configJson;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('配置已复制到剪贴板');
      });
    };
    
    // 导入配置
    const importConfig = () => {
      try {
        const success = importLinkConfig(importText.value);
        if (success) {
          showImportDialog.value = false;
          importText.value = '';
          emit('configChange', config);
          alert('配置导入成功');
        } else {
          alert('配置格式错误，请检查JSON格式');
        }
      } catch (error) {
        alert('配置导入失败：' + error);
      }
    };
    
    return {
      config,
      pathTypes,
      themes,
      showImportDialog,
      importText,
      getThemeName,
      isCurrentTheme,
      updateConfig,
      applyTheme,
      resetConfig,
      exportConfig,
      importConfig
    };
  }
});
</script>

<style lang="scss" scoped>
.link-config-panel {
  width: 320px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    
    &:hover {
      background: #e9ecef;
      color: #333;
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.config-section {
  margin-bottom: 24px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #495057;
  }
}

.path-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-type-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3498db;
    background: #f8f9ff;
  }
  
  &.active {
    border-color: #3498db;
    background: #e3f2fd;
  }
  
  input[type="radio"] {
    display: none;
  }
  
  .path-preview {
    flex-shrink: 0;
  }
  
  span {
    font-size: 13px;
    color: #495057;
  }
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  label {
    font-size: 13px;
    color: #495057;
    min-width: 80px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .value {
    font-size: 12px;
    color: #6c757d;
    min-width: 40px;
    text-align: right;
  }
}

.color-input {
  width: 40px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
}

.range-input {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #3498db;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #3498db;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
}

.select-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
}

.sync-btn {
  padding: 4px 8px;
  font-size: 11px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background: #e9ecef;
  }
}

.theme-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.theme-btn {
  padding: 8px 12px;
  font-size: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  
  &.active {
    background: #3498db;
    color: white;
    border-color: #3498db;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reset-btn, .export-btn, .import-btn {
  padding: 8px 16px;
  font-size: 13px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn {
  background: #f8f9fa;
  color: #495057;
  
  &:hover {
    background: #e9ecef;
  }
}

.export-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
  
  &:hover {
    background: #218838;
  }
}

.import-btn {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
  
  &:hover {
    background: #138496;
  }
}

.import-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }
}

.import-textarea {
  width: 100%;
  height: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
}

.import-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
  }
}

.cancel-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #5a6268;
  }
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>