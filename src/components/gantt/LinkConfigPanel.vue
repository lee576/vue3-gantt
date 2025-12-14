<template>
  <div class="link-config-panel" :class="{ 'panel-open': isOpen }">
    <!-- 面板切换按钮 -->
    <button 
      class="panel-toggle" 
      @click="togglePanel"
      :title="isOpen ? '关闭连线配置' : '打开连线配置'"
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
        <path d="M2 17L12 22L22 17" fill="currentColor"/>
        <path d="M2 12L12 17L22 12" fill="currentColor"/>
      </svg>
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
    background: #00bcd4;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    
    &:hover {
      background: #0097a7;
      transform: scale(1.1);
    }
  }
  
  .panel-content {
    position: absolute;
    top: 60px;
    right: 0;
    width: 320px;
    max-height: 80vh;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    overflow: hidden;
    
    .panel-header {
      background: #00bcd4;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        
        &:hover {
          background: rgba(255,255,255,0.2);
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
    margin-bottom: 25px;
    
    h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
  }
  
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    
    .theme-btn {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #00bcd4;
      }
      
      &.active {
        border-color: #00bcd4;
        background: #e0f7fa;
      }
      
      .theme-preview {
        margin-bottom: 5px;
      }
      
      .theme-name {
        font-size: 12px;
        color: #666;
      }
    }
  }
  
  .config-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    label {
      flex: 1;
      font-size: 13px;
      color: #555;
    }
    
    input[type="color"] {
      width: 40px;
      height: 30px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    input[type="range"] {
      flex: 1;
      margin: 0 10px;
    }
    
    input[type="checkbox"] {
      margin-right: 8px;
    }
    
    select {
      flex: 1;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .value {
      min-width: 40px;
      text-align: right;
      font-size: 12px;
      color: #666;
    }
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    
    .btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s ease;
      
      &.btn-primary {
        background: #00bcd4;
        color: white;
        
        &:hover {
          background: #0097a7;
        }
      }
      
      &.btn-secondary {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #ddd;
        
        &:hover {
          background: #e9ecef;
        }
      }
      
      &.btn-warning {
        background: #ff9800;
        color: white;
        
        &:hover {
          background: #f57c00;
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