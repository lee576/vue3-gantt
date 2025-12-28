import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import removeConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 如果是库模式
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        removeConsole(),
        dts({
          insertTypesEntry: true,
          include: ['src/index.ts', 'src/components/gantt/**/*.ts', 'src/components/gantt/**/*.vue'],
          exclude: ['src/main.ts', 'src/App.vue'],
          // 确保生成完整的类型定义
          copyDtsFiles: true
        })
      ],
      build: {
        lib: {
          // 入口文件
          entry: './src/index.ts',
          name: 'Vue3Gantt',
          // 输出文件名
          fileName: (format) => `vue3-gantt.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          // 确保外部化处理那些你不想打包进库的依赖
          // 注意：zod 在 UMD 模式下不好使用，所以只在 ES 模式下外部化
          external: (id) => {
            // Vue 和其他常用库总是外部化
            if (['vue', 'dayjs', '@vueuse/core', 'interactjs', 'svg.js'].includes(id)) {
              return true;
            }
            return false;
          },
          output: {
            // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
            globals: {
              vue: 'Vue',
              dayjs: 'dayjs',
              '@vueuse/core': 'VueUse',
              'interactjs': 'interact',
              'svg.js': 'SVG'
            },
            // 为 CSS 添加单独的输出（包含所有主题和基础样式）
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'vue3-gantt.css';
              return assetInfo.name || 'assets/[name][extname]';
            }
          }
        },
        // 生成 sourcemap
        sourcemap: true,
        // 压缩
        minify: 'esbuild'
      }
    }
  }
  
  // 开发模式配置
  return {
    plugins: [vue()]
  }
})
