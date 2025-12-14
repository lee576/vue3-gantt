<template>
  <div class="link-config-panel" :class="{ 'panel-open': isOpen }">
    <!-- 面板切换按钮 -->
    <button 
      class="panel-toggle" 
      @click="togglePanel"
      :title="isOpen ? '关闭连线配置' : '打开连线配置'"
    >
      <div class="toggle-icon" :class="{ 'icon-rotate': isOpen }">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <!-- 连线图标 -->
          <path d="M4 12h4l2-4 4 8 2-4h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- 设置齿轮 -->
          <circle cx="18" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M18 3v6M15.5 4.5l5 3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="toggle-text">连线</span>
    </button>
    
    <!-- 配置面板 -->
    <div class="panel-content" v-show="isOpen">
      <div class="panel-header">
        <h3>连线配置</h3>
        <button class="close-btn" @click="isOpen = false">×</button>
      </div>
      
      <div class="panel-body">
        <!-- 主题选择 -->
        <div class="config-section">
          <h4>预设主题</h4>
          <div class="theme-grid">
            <button
              v-for="(theme, name) in themes"
              :key="name"
              class="theme-btn"
              :class="{ active: currentTheme === name }"
              @click="selectTheme(name)"
            >
              <div class="theme-preview">
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <path
                    d="M5 10 L35 10"
                    :stroke="theme.color"
                    :stroke-width="theme.width"
                    :stroke-dasharray="theme.dashArray"
                    fill="none"
                  />
                  <polygon
                    v-if="theme.showArrow"
                    points="35,10 30,7 30,13"
                    :fill="theme.arrowColor || theme.color"
                  />
                </svg>
              </div>
              <span class="theme-name">{{ getThemeName(name) }}</span>
            </button>
          </div>
        </div>
        
        <!-- 基础设置 -->
        <div class="config-section">
          <h4>基础设置</h4>
          
          <div class="config-item">
            <label>连线颜色</label>
            <input 
              type="color" 
              v-model="localConfig.color"
              @change="updateConfig"
            />
          </div>
          
          <div class="config-item">
            <label>连线宽度</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              v-model.number="localConfig.width"
              @input="updateConfig"
            />
            <span class="value">{{ localConfig.width }}px</span>
          </div>
          
          <div class="config-item">
            <label>圆角半径</label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              v-model.number="localConfig.cornerRadius"
              @input="updateConfig"
            />
            <span class="value">{{ localConfig.cornerRadius }}px</span>
          </div>
          
          <div class="config-item">
            <label>虚线样式</label>
            <select v-model="localConfig.dashArray" @change="updateConfig">
              <option :value="undefined">实线</option>
              <option value="3,3">短虚线</option>
              <option value="5,5">中虚线</option>
              <option value="10,5">长虚线</option>
              <option value="5,2,2,2">点划线</option>
            </select>
          </div>
        </div>
        
        <!-- 箭头设置 -->
        <div class="config-section">
          <h4>箭头设置</h4>
          
          <div class="config-item">
            <label>
              <input 
                type="checkbox" 
                v-model="localConfig.showArrow"
                @change="updateConfig"
              />
              显示箭头
            </label>
          </div>
          
          <div class="config-item" v-if="localConfig.showArrow">
            <label>箭头颜色</label>
            <input 
              type="color" 
              v-model="localConfig.arrowColor"
              @change="updateConfig"
            />
          </div>
          
          <div class="config-item" v-if="localConfig.showArrow">
            <label>箭头大小</label>
            <input 
              type="range" 
              min="4" 
              max="20" 
              v-model.number="localConfig.arrowSize"
              @input="updateConfig"
            />
            <span class="value">{{ localConfig.arrowSize }}px</span>
          </div>
        </div>
        
        <!-- 标签设置 -->
        <div class="config-section">
          <h4>标签设置</h4>
          
          <div class="config-item">
            <label>
              <input 
                type="checkbox" 
                v-model="localConfig.showLabels"
                @change="updateConfig"
              />
              显示标签
            </label>
          </div>
          
          <div class="config-item" v-if="localConfig.showLabels">
            <label>标签颜色</label>
            <input 
              type="color" 
              v-model="localConfig.labelColor"
              @change="updateConfig"
            />
          </div>
          
          <div class="config-item" v-if="localConfig.showLabels">
            <label>字体大小</label>
            <input 
              type="range" 
              min="8" 
              max="20" 
              v-model.number="localConfig.labelFontSize"
              @input="updateConfig"
            />
            <span class="value">{{ localConfig.labelFontSize }}px</span>
          </div>
        </div>
        
        <!-- 父子关系设置 -->
        <div class="config-section">
          <h4>父子关系</h4>
          
          <div class="config-item">
            <label>颜色</label>
            <input 
              type="color" 
              v-model="localConfig.parentChildStyle.color"
              @change="updateConfig"
            />
          </div>
          
          <div class="config-item">
            <label>宽度</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              v-model.number="localConfig.parentChildStyle.width"
              @input="updateConfig"
            />
            <span class="value">{{ localConfig.parentChildStyle.width }}px</span>
          </div>
          
          <div class="config-item">
            <label>样式</label>
            <select v-model="localConfig.parentChildStyle.dashArray" @change="updateConfig">
              <option :value="undefined">实线</option>
              <option value="2,2">细虚线</option>
              <option value="3,3">短虚线</option>
              <option value="5,2">点划线</option>
            </select>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="config-section">
          <div class="action-buttons">
            <button class="btn btn-primary" @click="applyConfig">应用配置</button>
            <button class="btn btn-secondary" @click="resetConfig">重置</button>
            <button class="btn btn-secondary" @click="exportConfig">导出</button>
            <button class="btn btn-secondary" @click="importConfig">导入</button>
          </div>
          <div class="action-buttons" style="margin-top: 10px;">
            <button class="btn btn-warning" @click="clearStorageConfig">清除存储</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导入配置对话框 -->
    <div class="import-dialog" v-if="showImportDialog" @click="closeImportDialog">
      <div class="dialog-content" @click.stop>
        <h3>导入配置</h3>
        <textarea 
          v-model="importText" 
          placeholder="粘贴配置JSON..."
          rows="10"
        ></textarea>
        <div class="dialog-actions">
          <button class="btn btn-primary" @click="doImport">导入</button>
          <button class="btn btn-secondary" @click="closeImportDialog">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue';
import { useLinkConfig, LinkThemes } from './LinkConfig';

export default defineComponent({
  name: 'LinkConfigPanel',
  setup() {
    const { 
      config, 
      setTheme, 
      updateConfig, 
      reset, 
      exportConfig: doExportConfig,
      importConfig: doImportConfig,
      clearStorage,
      themes 
    } = useLinkConfig();
    
    const isOpen = ref(false);
    const currentTheme = ref<keyof typeof LinkThemes>('default');
    const localConfig = reactive({ ...config });
    const showImportDialog = ref(false);
    const importText = ref('');
    
    // 主题名称映射
    const themeNames = {
      default: '默认',
      business: '商务',
      modern: '现代',
      minimal: '简约',
      colorful: '彩色'
    };
    
    const getThemeName = (name: keyof typeof LinkThemes) => {
      return themeNames[name] || name;
    };
    
    const togglePanel = () => {
      isOpen.value = !isOpen.value;
    };
    
    const selectTheme = (themeName: keyof typeof LinkThemes) => {
      currentTheme.value = themeName;
      setTheme(themeName);
      Object.assign(localConfig, config);
    };
    
    const updateLocalConfig = () => {
      updateConfig(localConfig);
    };
    
    const applyConfig = () => {
      updateConfig(localConfig);
    };
    
    const resetConfig = () => {
      reset();
      Object.assign(localConfig, config);
      currentTheme.value = 'default';
    };
    
    const clearStorageConfig = () => {
      if (confirm('确定要清除所有保存的配置吗？这将重置为默认设置。')) {
        clearStorage();
        Object.assign(localConfig, config);
        currentTheme.value = 'default';
        alert('配置已清除');
      }
    };
    
    const exportConfig = () => {
      const configJson = doExportConfig();
      navigator.clipboard.writeText(configJson).then(() => {
        alert('配置已复制到剪贴板');
      }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = configJson;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('配置已复制到剪贴板');
      });
    };
    
    const importConfig = () => {
      showImportDialog.value = true;
    };
    
    const doImport = () => {
      if (doImportConfig(importText.value)) {
        Object.assign(localConfig, config);
        showImportDialog.value = false;
        importText.value = '';
        alert('配置导入成功');
      } else {
        alert('配置格式错误，导入失败');
      }
    };
    
    const closeImportDialog = () => {
      showImportDialog.value = false;
      importText.value = '';
    };
    
    // 监听配置变化
    watch(config, (newConfig) => {
      Object.assign(localConfig, newConfig);
    }, { deep: true });
    
    return {
      isOpen,
      currentTheme,
      localConfig,
      showImportDialog,
      importText,
      themes,
      getThemeName,
      togglePanel,
      selectTheme,
      updateConfig: updateLocalConfig,
      applyConfig,
      resetConfig,
      exportConfig,
      importConfig,
      doImport,
      closeImportDialog,
      clearStorageConfig
    };
  }
});
</script>

<style lang="scss" scoped>
.link-config-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  
  .panel-toggle {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 16px;
    width: 80px;
    height: 56px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      
      &::before {
        left: 100%;
      }
      
      .toggle-icon {
        transform: scale(1.1);
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .toggle-icon {
      transition: all 0.3s ease;
      
      &.icon-rotate {
        transform: rotate(180deg);
      }
      
      svg {
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
      }
    }
    
    .toggle-text {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
  }
  
  .panel-content {
    position: absolute;
    top: 70px;
    right: 0;
    width: 340px;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.05);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    
    .panel-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      }
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '⚡';
          font-size: 16px;
        }
      }
      
      .close-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
    
    .panel-body {
      max-height: calc(80vh - 60px);
      overflow-y: auto;
      padding: 20px;
    }
  }
  
  .config-section {
    margin-bottom: 28px;
    
    h4 {
      margin: 0 0 18px 0;
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      position: relative;
      padding-bottom: 8px;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 3px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 2px;
      }
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: #e5e7eb;
      }
    }
  }
  
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .theme-btn {
      background: linear-gradient(145deg, #f8f9fa, #e9ecef);
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        border-color: rgba(102, 126, 234, 0.3);
        
        &::before {
          opacity: 1;
        }
      }
      
      &.active {
        border-color: #667eea;
        background: linear-gradient(145deg, #667eea, #764ba2);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
        
        .theme-name {
          color: white;
        }
      }
      
      .theme-preview {
        margin-bottom: 8px;
        padding: 4px;
        background: rgba(255,255,255,0.8);
        border-radius: 6px;
      }
      
      .theme-name {
        font-size: 12px;
        font-weight: 500;
        color: #666;
        transition: color 0.3s ease;
      }
    }
  }
  
  .config-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px 0;
    
    label {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    
    input[type="color"] {
      width: 44px;
      height: 32px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #667eea;
        transform: scale(1.05);
      }
    }
    
    input[type="range"] {
      flex: 1;
      margin: 0 12px;
      height: 6px;
      border-radius: 3px;
      background: #e5e7eb;
      outline: none;
      
      &::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
        transition: all 0.2s ease;
        
        &:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }
      
      &::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
      }
    }
    
    input[type="checkbox"] {
      margin-right: 10px;
      width: 16px;
      height: 16px;
      accent-color: #667eea;
    }
    
    select {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #667eea;
      }
      
      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
    
    .value {
      min-width: 45px;
      text-align: right;
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
    }
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
      }
      
      &:active::before {
        width: 300px;
        height: 300px;
      }
      
      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      }
      
      &.btn-secondary {
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        color: #495057;
        border: 1px solid rgba(0,0,0,0.1);
        
        &:hover {
          background: linear-gradient(145deg, #e9ecef, #dee2e6);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      }
      
      &.btn-warning {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
        }
      }
    }
  }
  
  .import-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    
    .dialog-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      width: 400px;
      max-width: 90vw;
      
      h3 {
        margin: 0 0 15px 0;
      }
      
      textarea {
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        resize: vertical;
      }
      
      .dialog-actions {
        margin-top: 15px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    }
  }
}

// 面板打开时的动画
.panel-open .panel-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>