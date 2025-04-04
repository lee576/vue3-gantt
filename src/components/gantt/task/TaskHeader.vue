<template>
    <div class="header">
      <template v-for='(item, index) in headers' :key="index">
        <div :property='item.property' :columnindex='index' v-show="item.show" class="headerCaption">
          <span :style="{ width: `${item.width}px` }">{{ item.title }}</span>
        </div>
      </template>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue';

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
    }
  });
  </script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  
  .headerCaption {
    text-align: center;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #6b6b6b;
    font-size: 15px;
    font-weight: bold;
    box-sizing: border-box;
    border-top: 2px solid #cecece;
    border-bottom: 1px solid #cecece;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 0;
      bottom: 0;
      background: #cecece;
      border-left: 1px solid #cecece;
    }
    
    &:first-child {
      border-left: 1px solid #cecece;
    }

    &:last-child {
      border-right: 1px solid #cecece;
    }
  }
}
</style>