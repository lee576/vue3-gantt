import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import removeConsole from 'vite-plugin-remove-console'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        removeConsole(),
        dts({
          insertTypesEntry: true,
          include: ['src/index.ts', 'src/components/gantt/**/*.ts', 'src/components/gantt/**/*.vue'],
          exclude: ['src/main.ts', 'src/App.vue'],
          copyDtsFiles: true
        })
      ],
      css: {
        postcss: {
          plugins: [
            tailwindcss(),
            autoprefixer()
          ]
        }
      },
      build: {
        lib: {
          entry: './src/index.ts',
          name: 'Vue3Gantt',
          fileName: (format) => `vue3-gantt.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          external: (id) => {
            if (['vue', 'dayjs', '@vueuse/core', 'interactjs', 'svg.js'].includes(id)) {
              return true;
            }
            return false;
          },
          output: {
            globals: {
              vue: 'Vue',
              dayjs: 'dayjs',
              '@vueuse/core': 'VueUse',
              'interactjs': 'interact',
              'svg.js': 'SVG'
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'vue3-gantt.css';
              return assetInfo.name || 'assets/[name][extname]';
            }
          }
        },
        sourcemap: true,
        minify: 'esbuild'
      }
    }
  }
  
  return {
    plugins: [vue()],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  }
})
