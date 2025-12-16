# Vue3 Gantt Chart Component

**Languages:** [English](README.en-US.md) | [简体中文](README.md)

A feature-rich, highly customizable Vue 3 Gantt chart component that supports task management, dependency relationships, multiple view modes, and theme switching.

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

## Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Vue3 Gantt Professional Component                    │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Task Name       │ 12/01  12/02  12/03  12/04  12/05  12/06  12/07  12/08   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Main Task 1     │ ████████████████████████████████████████████ 85%        │
│   Subtask 1.1   │   ████████████ 100%                                     │
│ Main Task 2     │       ████████████████████████████ 60%                  │
│ Main Task 3     │             ████████████████ 45%                        │
│ Main Task 4     │                   ████████ 30%                          │
│ Main Task 5     │                       ████ 0%                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

**Key Features:**
- 🎯 Left task list + Right Gantt chart timeline
- 📊 Visual progress bars showing task completion
- 🔗 Task dependency relationship lines
- 🎨 Multi-theme support (Light/Dark/Colorful, etc.)
- 🖱️ Drag to adjust task time and progress
- 🌍 Multi-language support (8 languages)

## Features

- **Multiple View Modes** - Month, Day, Week, and Hour time granularity views
- **Task Dependencies** - Support for FS, SS, FF, SF dependency types
- **Theme System** - 5 built-in themes with custom theme support
- **Internationalization** - Built-in 8 languages, easily extensible
- **Progress Management** - Visual progress bars with drag-to-adjust
- **Interactive Operations** - Task dragging, resizing, parent-child linkage
- **Responsive Design** - Adjustable split panel ratio
- **High Performance** - Virtual scrolling optimization for large datasets

## Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Dependencies

- @vueuse/core ^13.0.0
- dayjs ^1.11.13
- interactjs ^1.10.27
- svg.js ^2.7.1
- vue ^3.5.13
- zod ^3.24.2

## Basic Usage

```vue
<template>
  <gantt 
    :styleConfig="styleConfig" 
    :dataConfig="dataConfig" 
    :eventConfig="eventConfig"
  />
</template>
```

```typescript
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig 
} from './components/gantt/Gantt.vue';
import { LinkType } from './components/gantt/Types';

// Style configuration
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,  // Header height
  rowHeight: 60,       // Row height
  setBarColor: (row) => {
    // Custom task bar color
    const colorMap = {
      'urgent': 'red',
      'important': 'blue',
      'normal': 'gray'
    };
    return colorMap[row.level] ?? 'black';
  }
});

// Data configuration
const dataConfig = ref<DataConfig>({
  queryStartDate: '',
  queryEndDate: '',
  dataSource: [],
  dependencies: [],
  mapFields: {
    id: 'id',
    parentId: 'pid',
    task: 'taskNo',
    priority: 'level',
    startdate: 'start_date',
    enddate: 'end_date',
    takestime: 'spend_time',
    progress: 'job_progress'
  },
  taskHeaders: [
    { title: 'No.', width: 80, property: 'no', show: true },
    { title: 'Task Name', width: 190, property: 'task', show: true },
    { title: 'Priority', width: 90, property: 'priority', show: true },
    { title: 'Start Date', width: 150, property: 'startdate', show: true },
    { title: 'End Date', width: 150, property: 'enddate', show: true },
    { title: 'Duration', width: 90, property: 'takestime', show: true }
  ]
});

// Event configuration
const eventConfig = ref<EventConfig>({
  addRootTask: (row) => console.log('Add root task', row),
  addSubTask: (task) => console.log('Add subtask', task),
  removeTask: (task) => console.log('Remove task', task),
  editTask: (task) => console.log('Edit task', task),
  queryTask: async (startDate, endDate, mode) => {
    // Query task data
    dataConfig.value.dataSource = await fetchTasks(startDate, endDate);
  },
  barDate: (id, startDate, endDate) => {
    console.log('Task date changed', id, startDate, endDate);
  },
  allowChangeTaskDate: (allow) => {
    console.log('Allow date change', allow);
  },
  updateProgress: (detail) => {
    console.log('Progress updated', detail);
  }
});

onMounted(() => {
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
  eventConfig.value.queryTask(startDate, endDate, 'Month');
});
```

## Configuration

### StyleConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| headersHeight | number | 100 | Header area height (pixels) |
| rowHeight | number | 60 | Row height (pixels) |
| setBarColor | function | - | Callback function for custom task bar colors |

### DataConfig

| Property | Type | Description |
|----------|------|-------------|
| queryStartDate | string | Query start date (YYYY-MM-DD) |
| queryEndDate | string | Query end date (YYYY-MM-DD) |
| dataSource | array | Task data source |
| dependencies | array | Task dependencies |
| mapFields | object | Field mapping configuration |
| taskHeaders | array | Left task table column configuration |

## Task Dependencies

```
Finish-Start (FS)  Start-Start (SS)   Finish-Finish (FF) Start-Finish (SF)
┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
│ Task A  │──┐     │ Task A  │──┐     │ Task A  │──┐     │ Task A  │◄─┐
└─────────┘  │     └─────────┘  │     └─────────┘  │     └─────────┘  │
             ▼                  ▼                  ▼                  │
         ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
         │ Task B  │        │ Task B  │        │ Task B  │        │ Task B  │
         └─────────┘        └─────────┘        └─────────┘        └─────────┘
     B starts after      A and B start      A and B finish      B starts 
     A finishes          together           together            before A ends
```

### Dependency Types

| Type | Enum | Description |
|------|------|-------------|
| Finish-Start (FS) | FINISH_TO_START | Task B starts after Task A finishes |
| Start-Start (SS) | START_TO_START | Tasks start simultaneously |
| Finish-Finish (FF) | FINISH_TO_FINISH | Tasks finish simultaneously |
| Start-Finish (SF) | START_TO_FINISH | Task A finishes after Task B starts |

## View Modes

| Mode | Time Unit | Header Example | Use Case |
|------|-----------|----------------|----------|
| 🗓️ **Month** | Day | `01 02 03 04 05 ...` | Long-term project planning |
| 📅 **Day** | Day | `Mon Tue Wed ...` | Short-term task management |
| 📊 **Week** | Week | `W50 W51 W52 ...` | Mid-term project tracking |
| ⏰ **Hour** | Hour | `08 09 10 11 12 ...` | Precise task scheduling |

## Theme System

| Theme | Primary Color | Style |
|-------|---------------|-------|
| 🔷 **Metro** | `#0078d4` | Microsoft Metro design language |
| 🌙 **Dark** | `#00d4ff` | Eye-friendly dark theme |
| ✨ **Modern** | `#6366f1` | Clean modern design |
| 💼 **Classic** | `#2563eb` | Traditional business style |
| 🎨 **Colorful** | `#f59e0b` | Vibrant colorful theme |

### Switching Themes

Click the theme selector in the top right corner of the component. Theme settings are automatically saved to localStorage.

## Internationalization

The component has a complete i18n system built-in, supporting 8 languages with easy extensibility.

### Supported Languages

| Language | Code | Status |
|----------|------|--------|
| 🇨🇳 Simplified Chinese | zh-CN | ✅ Full support |
| 🇺🇸 English | en-US | ✅ Full support |
| 🇯🇵 Japanese | ja-JP | ✅ Full support |
| 🇰🇷 Korean | ko-KR | ✅ Full support |
| 🇫🇷 French | fr-FR | ✅ Full support |
| 🇩🇪 German | de-DE | ✅ Full support |
| 🇪🇸 Spanish | es-ES | ✅ Full support |
| 🇷🇺 Russian | ru-RU | ✅ Full support |

### Usage

#### Switch Language

```typescript
import { setLocale } from './components/gantt/i18n';

// Switch to English
setLocale('en-US');

// Switch to Chinese
setLocale('zh-CN');
```

#### Use in Components

```vue
<script setup lang="ts">
import { useI18n } from './components/gantt/i18n';

const { t, locale } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <button>{{ t('common.confirm') }}</button>
  </div>
</template>
```

### i18n Features

- ✅ **Instant Switching** - No page refresh required
- ✅ **Auto Save** - Language preference saved to localStorage
- ✅ **Complete Coverage** - All interface text translated
- ✅ **Dynamic Headers** - Timeline headers (months, weekdays) auto-formatted
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Easy Extension** - Simple to add new languages

## Interactive Features

| Operation | Description | Effect |
|-----------|-------------|--------|
| 🖱️ **Drag & Move** | Drag entire task bar | Modify task start and end dates |
| 📏 **Resize** | Drag task bar edges | Adjust task duration |
| 📊 **Progress Adjust** | Drag triangle slider at bottom | Adjust task completion progress |

### Task Operations

- **Drag & Move** - Drag task bar to modify start and end dates
- **Resize** - Drag task bar edges to adjust duration
- **Progress Adjust** - Drag triangle slider to adjust progress

### Parent-Child Linkage

- Moving parent tasks moves child tasks
- Resizing parent tasks checks child constraints
- Child tasks cannot start before parent tasks

## Link Configuration

### Link Styles

```typescript
interface LinkConfig {
  color: string;              // Link color
  width: number;              // Link width
  dashArray?: string;         // Dash style
  showArrow: boolean;         // Show arrow
  arrowSize: number;          // Arrow size
  showLabels: boolean;        // Show labels
  pathType: LinkPathType;     // Path type
  cornerRadius: number;       // Corner radius
  smoothCorners: boolean;     // Smooth corners
}
```

### Path Types

| Type | Enum | Description |
|------|------|-------------|
| Straight | STRAIGHT | Direct connection |
| Bezier | BEZIER | Smooth curve |
| Right Angle | RIGHT_ANGLE | Right-angle connection |

## Performance Optimization

- **Virtual Scrolling** - Render only visible tasks
- **Throttled Updates** - Avoid frequent re-renders
- **Computed Caching** - Cache complex calculations
- **On-Demand Rendering** - Calculate and render links as needed

## Project Structure

```
src/
├── components/
│   └── gantt/
│       ├── Gantt.vue              # Main component
│       ├── Bar.vue                # Task bar component
│       ├── TaskLinks.vue          # Link component
│       ├── TimelineHeader.vue     # Timeline header
│       ├── DatePicker.vue         # Date picker
│       ├── GanttConfigPanel.vue   # Configuration panel
│       ├── Types.ts               # Type definitions
│       ├── Store.ts               # State management
│       ├── LinkConfig.ts          # Link configuration
│       ├── i18n/                  # i18n system
│       │   ├── index.ts           # i18n core
│       │   └── locales/           # Language packs
│       │       ├── zh-CN.ts       # Chinese
│       │       ├── en-US.ts       # English
│       │       ├── ja-JP.ts       # Japanese
│       │       ├── ko-KR.ts       # Korean
│       │       ├── fr-FR.ts       # French
│       │       ├── de-DE.ts       # German
│       │       ├── es-ES.ts       # Spanish
│       │       └── ru-RU.ts       # Russian
│       └── themes/                # Theme config
│           └── GanttThemes.ts
├── App.vue                        # Example app
├── main.ts                        # Entry point
└── style.css                      # Global styles
```

## Complete Example

Refer to `src/App.vue` for a complete usage example including:

- Multi-level task structure
- Various dependency configurations
- Custom color mapping
- Event handling
- i18n integration

## Browser Support

- Chrome (Recommended)
- Firefox
- Safari
- Edge

## License

MIT
