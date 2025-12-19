<template>
  <div ref="splitPane" class="split-pane" :class="direction" :style="{ flexDirection: direction }">
    <div class="pane pane-one" :style="`${lengthType}: ${paneLengthValue}`">
      <slot name="one"></slot>
    </div>
    <div
      ref="trigger"
      class="pane-trigger"
      v-if="triggerDefaultColor && triggerMoveColor"
      :style="`${lengthType}: ${triggerLengthValue}; ${triggerBackGroud}`"
    >
      <div
        @click="handleMouseOver"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @mousedown="handleMouseDown"
        class="icon"
        :style="`${lengthType}: ${triggerLengthValue}; filter: ${iconStyle}`"
      ></div>
    </div>
    <div class="pane pane-two" :style="`${lengthType}: calc(${100 - paneLengthPercent}% - ${triggerLength / 2}px)`">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { ganttThemeManager } from '../themes/GanttThemes';

export default defineComponent({
  props: {
    direction: {
      type: String as () => 'row' | 'column' ,
      default: 'row'
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    paneLengthPercent: {
      type: Number,
      required: true
    },
    triggerLength: {
      type: Number,
      required: true
    }
  },
  emits: ['update:paneLengthPercent'],
  setup(props, { emit }) {
    let splitPane = ref<HTMLElement | null>(null);
    let trigger = ref<HTMLElement | null>(null);
    let triggerLeftOffset = ref(0); // 鼠标距滑动器左(顶)侧偏移量
    let triggerBackGroud = ref('');
    const currentTheme = ref(ganttThemeManager.getCurrentTheme());

    // 计算属性
    const lengthType = computed(() => (props.direction === 'row' ? 'width' : 'height'));

    // 根据主题动态计算拖拽条默认颜色
    const triggerDefaultColor = computed(() => {
      const theme = currentTheme.value;
      const isRow = props.direction === 'row';
      
      // 为每个主题定义不同的渐变色
      const themeColors: Record<string, { default: string; move: string }> = {
        metro: {
          default: isRow 
            ? '-webkit-gradient(linear,left top,right top,from(#ffffff), to(#d0d0d0))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#ffffff), to(#d0d0d0))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#1084d8), to(#0078d4))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#1084d8), to(#0078d4))'
        },
        dark: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#3a3a3a), to(#1f1f1f))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#3a3a3a), to(#1f1f1f))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#33ddff), to(#00d4ff))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#33ddff), to(#00d4ff))'
        },
        modern: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f8fafc), to(#e2e8f0))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f8fafc), to(#e2e8f0))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#818cf8), to(#6366f1))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#818cf8), to(#6366f1))'
        },
        classic: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f0f4f8), to(#cbd5e1))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f0f4f8), to(#cbd5e1))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#3b82f6), to(#2563eb))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#3b82f6), to(#2563eb))'
        },
        colorful: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#fef3c7), to(#fbbf24))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#fef3c7), to(#fbbf24))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f59e0b), to(#d97706))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f59e0b), to(#d97706))'
        },
        apple: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0.95)), to(rgba(242,242,247,0.95)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(255,255,255,0.95)), to(rgba(242,242,247,0.95)))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#4da6ff), to(#007aff))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#4da6ff), to(#007aff))'
        },
        liquidGlass: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0.6)), to(rgba(215,215,217,0.4)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(255,255,255,0.6)), to(rgba(215,215,217,0.4)))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(166,212,225,0.8)), to(rgba(37,145,200,0.6)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(166,212,225,0.8)), to(rgba(37,145,200,0.6)))'
        }
      };
      
      return themeColors[theme]?.default || themeColors.metro.default;
    });

    // 根据主题动态计算鼠标拖动时拖拽条的颜色
    const triggerMoveColor = computed(() => {
      const theme = currentTheme.value;
      const isRow = props.direction === 'row';
      
      const themeColors: Record<string, { default: string; move: string }> = {
        metro: {
          default: isRow 
            ? '-webkit-gradient(linear,left top,right top,from(#ffffff), to(#d0d0d0))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#ffffff), to(#d0d0d0))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#1084d8), to(#0078d4))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#1084d8), to(#0078d4))'
        },
        dark: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#3a3a3a), to(#1f1f1f))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#3a3a3a), to(#1f1f1f))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#33ddff), to(#00d4ff))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#33ddff), to(#00d4ff))'
        },
        modern: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f8fafc), to(#e2e8f0))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f8fafc), to(#e2e8f0))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#818cf8), to(#6366f1))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#818cf8), to(#6366f1))'
        },
        classic: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f0f4f8), to(#cbd5e1))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f0f4f8), to(#cbd5e1))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#3b82f6), to(#2563eb))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#3b82f6), to(#2563eb))'
        },
        colorful: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#fef3c7), to(#fbbf24))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#fef3c7), to(#fbbf24))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#f59e0b), to(#d97706))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#f59e0b), to(#d97706))'
        },
        apple: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0.95)), to(rgba(242,242,247,0.95)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(255,255,255,0.95)), to(rgba(242,242,247,0.95)))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(#4da6ff), to(#007aff))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(#4da6ff), to(#007aff))'
        },
        liquidGlass: {
          default: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0.6)), to(rgba(215,215,217,0.4)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(255,255,255,0.6)), to(rgba(215,215,217,0.4)))',
          move: isRow
            ? '-webkit-gradient(linear,left top,right top,from(rgba(166,212,225,0.8)), to(rgba(37,145,200,0.6)))'
            : '-webkit-gradient(linear, 0 0, 0 bottom, from(rgba(166,212,225,0.8)), to(rgba(37,145,200,0.6)))'
        }
      };
      
      return themeColors[theme]?.move || themeColors.metro.move;
    });

    const paneLengthValue = computed(() => `calc(${props.paneLengthPercent}% - ${props.triggerLength / 2}px)`);
    const triggerLengthValue = computed(() => `${props.triggerLength}px`);

    // 根据主题动态计算图标颜色/滤镜
    const iconStyle = computed(() => {
      const theme = currentTheme.value;
      
      // 为每个主题定义图标滤镜效果
      const iconFilters: Record<string, string> = {
        metro: 'brightness(0.4) opacity(0.5)',
        dark: 'brightness(0) invert(1) opacity(0.9)',  // 反色 + 高亮度
        modern: 'grayscale(0.3) brightness(0.6) opacity(0.4)',
        classic: 'contrast(1.2) brightness(0.5) opacity(0.5)',
        colorful: 'hue-rotate(-30deg) saturate(1.5) brightness(0.7) opacity(0.6)',
        apple: 'brightness(0.5) contrast(1.1) opacity(0.45)',
        liquidGlass: 'opacity(0.6)'
      };
      
      return iconFilters[theme] || iconFilters.metro;
    });

    // Hover 时的图标样式
    const iconHoverStyle = computed(() => {
      const theme = currentTheme.value;
      
      const iconHoverFilters: Record<string, string> = {
        metro: 'brightness(0.3) opacity(0.8)',
        dark: 'brightness(0) invert(1) opacity(1) drop-shadow(0 0 3px cyan)',
        modern: 'grayscale(0) brightness(0.5) hue-rotate(240deg) opacity(0.8)',
        classic: 'contrast(1.5) brightness(0.4) saturate(1.5) opacity(0.9)',
        colorful: 'hue-rotate(-20deg) saturate(2) brightness(0.6) contrast(1.2) opacity(0.95)',
        apple: 'brightness(0.35) contrast(1.3) saturate(1.2) opacity(0.85)',
        liquidGlass: 'opacity(0.9)'
      };
      
      return iconHoverFilters[theme] || iconHoverFilters.metro;
    });

    // 生命周期钩子
    onMounted(async () => {
      await nextTick();
      triggerBackGroud.value = `background: ${triggerDefaultColor.value}`;
    });

    // 方法
    const handleMouseLeave = async () => {
      await nextTick();
      triggerBackGroud.value = `background: ${triggerDefaultColor.value}`;
    };

    const handleMouseOver = async () => {
      await nextTick();
      triggerBackGroud.value = `background: ${triggerMoveColor.value}`;
    };

    // 按下滑动器
    const handleMouseDown = (e: MouseEvent) => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      if (props.direction === 'row') {
        triggerLeftOffset.value = e.pageX - (e.target as HTMLElement).getBoundingClientRect().left;
      } else {
        triggerLeftOffset.value = e.pageY - (e.target as HTMLElement).getBoundingClientRect().top;
      }
    };

    // 按下滑动器后移动鼠标
    const handleMouseMove = async (e: MouseEvent) => {
      await nextTick();
      triggerBackGroud.value = `background: ${triggerMoveColor.value}`;
      if (splitPane.value) {
        const clientRect = splitPane.value.getBoundingClientRect();
        let paneLengthPercent = 0;
        if (props.direction === 'row') {
          const offset = e.pageX - clientRect.left - triggerLeftOffset.value + props.triggerLength / 2;
          paneLengthPercent = (offset / clientRect.width) * 100;
        } else {
          const offset = e.pageY - clientRect.top - triggerLeftOffset.value + props.triggerLength / 2;
          paneLengthPercent = (offset / clientRect.height) * 100;
        }
        if (paneLengthPercent < props.min) {
          paneLengthPercent = props.min;
        }
        if (paneLengthPercent > props.max) {
          paneLengthPercent = props.max;
        }
        emit('update:paneLengthPercent', paneLengthPercent);
      }
    };

    // 松开滑动器
    const handleMouseUp = async () => {
      await nextTick();
      triggerBackGroud.value = `background: ${triggerDefaultColor.value}`;
      document.removeEventListener('mousemove', handleMouseMove);
    };

    // 监听主题变化
    const themeCheckInterval = setInterval(() => {
      const newTheme = ganttThemeManager.getCurrentTheme();
      if (newTheme !== currentTheme.value) {
        currentTheme.value = newTheme;
        triggerBackGroud.value = `background: ${triggerDefaultColor.value}`;
      }
    }, 100);

    // 组件卸载时清除定时器
    onUnmounted(() => {
      clearInterval(themeCheckInterval);
    });

    return {
      splitPane,
      trigger,
      lengthType,
      triggerDefaultColor,
      triggerMoveColor,
      paneLengthValue,
      triggerLengthValue,
      triggerBackGroud,
      iconStyle,
      iconHoverStyle,
      handleMouseLeave,
      handleMouseOver,
      handleMouseDown,
      handleMouseUp
    };
  }
});
</script>

<style lang="scss" scoped>
$icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNCSVQICAgIfAhkiAAAAIJJREFUKFNjZMANBIBS64E4EIg/YFPGiEdzA1AuHogbgRjExgAgzQeA+D8WOQckMZAanJrxOAC3FD5nEzSQYs0gv2HzM1E2k6URZDLI2cihStA2ZAUU+5kk29BtxpVICBoKS2HYFNojCR7ElcJw2dAAlCCYtnFpBuWqDUAcAMRYcxUAYvURjNoDrtgAAAAASUVORK5CYII=';
$background-size: 10px 10px;

.split-pane {
  background: transparent;
  height: 100%;
  min-height: 0; /* 允许 flex 布局正常工作 */
  display: flex;

  .pane-one {
    background: transparent;
  }

  .pane-trigger {
    border-radius: 25px;
    user-select: none;
    border-width: 0.1em;
    transition: all 0.2s ease;
  }

  .pane-two {
    flex: 1;
    background: transparent;
  }

  // 横向布局
  &.row {
    .pane {
      height: 100%;
    }

    .pane-trigger {
      margin-left: 1px;
      margin-right: 1px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .icon {
        cursor: col-resize;
        height: 10px;
        width: 100%;
        background-image: url(#{$icon});
        background-repeat: no-repeat;
        background-size: $background-size;
        transform: rotate(90deg);
      }
    }
  }

  // 纵向布局
  &.column {
    .pane {
      width: 100%;
    }

    .pane-trigger {
      margin-top: 1px;
      margin-bottom: 1px;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      .icon {
        cursor: row-resize;
        height: 100%;
        width: 10px;
        background-image: url(#{$icon});
        background-repeat: no-repeat;
        background-size: $background-size;
      }
    }
  }
}
</style>