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
        :style="`${lengthType}: ${triggerLengthValue}`"
      ></div>
    </div>
    <div class="pane pane-two" :style="`${lengthType}: calc(${100 - paneLengthPercent}% - ${triggerLength / 2}px)`">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';

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

    // 计算属性
    const lengthType = computed(() => (props.direction === 'row' ? 'width' : 'height'));

    // 拖拽条默认颜色
    const triggerDefaultColor = computed(() =>
      props.direction === 'row'
        ? '-webkit-gradient(linear,left top,right top,from(white), to(#D7D7D9))'
        : '-webkit-gradient(linear, 0 0, 0 bottom, from(white), to(#D7D7D9))'
    );

    // 鼠标拖动时拖拽条的颜色
    const triggerMoveColor = computed(() =>
      props.direction === 'row'
        ? '-webkit-gradient(linear,left top,right top,from(#A6D4E1), to(#2591C8))'
        : '-webkit-gradient(linear, 0 0, 0 bottom, from(#A6D4E1), to(#2591C8))'
    );

    const paneLengthValue = computed(() => `calc(${props.paneLengthPercent}% - ${props.triggerLength / 2}px)`);
    const triggerLengthValue = computed(() => `${props.triggerLength}px`);

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

    return {
      splitPane,
      trigger,
      lengthType,
      triggerDefaultColor,
      triggerMoveColor,
      paneLengthValue,
      triggerLengthValue,
      triggerBackGroud,
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
  display: flex;

  .pane-one {
    background: transparent;
  }

  .pane-trigger {
    border-radius: 25px;
    user-select: none;
    border-width: 0.1em;
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