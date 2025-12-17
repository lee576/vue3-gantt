import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 如果是库模式
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        dts({
          insertTypesEntry: true,
          include: ['src/index.ts', 'src/components/gantt/**/*.ts', 'src/components/gantt/**/*.vue'],
          exclude: ['src/main.ts', 'src/App.vue']
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
          external: ['vue', 'dayjs', '@vueuse/core', 'interactjs', 'svg.js', 'zod'],
          output: {
            // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
            globals: {
              vue: 'Vue',
              dayjs: 'dayjs',
              '@vueuse/core': 'VueUse',
              'interactjs': 'interact',
              'svg.js': 'SVG',
              'zod': 'zod'
            },
            // 为 CSS 添加单独的输出
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
