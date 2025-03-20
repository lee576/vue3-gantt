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
    border-left: 1px solid #cecece;
    border-top: 1px solid #cecece;
    border-bottom: 1px solid #cecece;
    width: fit-content;

    .headerCaption {
      text-align: center;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #cecece;
      color: #6b6b6b;
      font-size: 15px;
      font-weight: bold;
    }
  }
  </style>