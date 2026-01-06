/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      './src/components/gantt/**/*.{vue,js,ts,jsx,tsx}',
      '../../index.html',
    ],
    transform: {
      vue: (content) => content,
    },
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gantt-primary': 'var(--gantt-primary, #3b82f6)',
        'gantt-secondary': 'var(--gantt-secondary, #64748b)',
        'gantt-success': 'var(--gantt-success, #22c55e)',
        'gantt-warning': 'var(--gantt-warning, #f59e0b)',
        'gantt-danger': 'var(--gantt-danger, #ef4444)',
        'gantt-bg': 'var(--gantt-bg, #ffffff)',
        'gantt-bg-dark': 'var(--gantt-bg-dark, #1e293b)',
        'gantt-border': 'var(--gantt-border, #e2e8f0)',
        'gantt-text': 'var(--gantt-text, #1e293b)',
        'gantt-text-muted': 'var(--gantt-text-muted, #64748b)',
      },
      height: {
        'gantt-bar': 'var(--gantt-bar-height, 32px)',
        'gantt-row': 'var(--gantt-row-height, 60px)',
        'gantt-header': 'var(--gantt-header-height, 100px)',
      },
      spacing: {
        'gantt-padding': 'var(--gantt-padding, 16px)',
      },
      screens: {
        'gantt-sm': '640px',
        'gantt-md': '768px',
        'gantt-lg': '1024px',
        'gantt-xl': '1280px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  safelist: [
    'bg-gradient-to-r',
    'from-indigo-500',
    'from-purple-500',
    'from-slate-50',
    'from-slate-100',
    'from-slate-200',
    'to-pink-500',
    'to-purple-600',
    'to-gray-100',
    'text-white',
    'font-bold',
    'px-4',
    'py-2',
    'flex',
    'items-center',
    'gap-2',
    'w-5',
    'h-5',
    {
      pattern: /^(bg|text|border|rounded|shadow|px|py|m-|p-|w-|h-|flex|items-|justify-|gap-).+/,
    },
    {
      pattern: /.*-base$/,
    },
    {
      pattern: /dark$/,
    },
  ],
}
