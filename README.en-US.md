# Vue3 Gantt Chart Component

**Languages:** [English](README.en-US.md) | [简体中文](README.md)

A feature-rich, highly customizable Vue 3 Gantt chart component that supports task management, dependency relationships, multiple view modes, and theme switching.

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

## Interface Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Vue3 Gantt Professional Component                    │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Task Name       │ 12/01  12/02  12/03  12/04  12/05  12/06  12/07  12/08   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Main Task 1 - Planning│ ████████████████████████████████████████████ 85%    │
│   Subtask 1.1 - Requirements│   ████████████ 100%                          │
│ Main Task 2 - Development│       ████████████████████████████ 60%          │
│ Main Task 3 - Testing│             ████████████████ 45%                    │
│ Main Task 4 - Deployment│                   ████████ 30%                   │
│ Main Task 5 - Maintenance│                       ████ 0%                    │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

**Key Features:**
- 🎯 Left task list + Right Gantt chart timeline
- 📊 Visual progress bars showing task completion
- 🔗 Task dependency relationship lines
- 🎨 Multi-theme support (Light/Dark/Colorful, etc.)
- 🖱️ Drag to adjust task time and progress
- 🌍 Multi-language support (Chinese/English/Japanese/Korean/French/German/Spanish/Russian)

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

## Configuration Details

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

#### mapFields Field Mapping

```typescript
{
  id: 'id',           // Task ID field
  parentId: 'pid',    // Parent task ID field (for hierarchy)
  task: 'taskNo',     // Task name field
  priority: 'level',  // Priority field
  startdate: 'start_date',  // Start date field
  enddate: 'end_date',      // End date field
  takestime: 'spend_time',  // Duration field
  progress: 'job_progress'  // Progress field (0-1)
}
```

#### taskHeaders Header Configuration

```typescript
{
  title: string;      // Column title
  width: number;      // Column width
  property: string;   // Corresponds to property name in mapFields
  show: boolean;      // Whether to display
}
```


### EventConfig

| Event | Parameters | Description |
|-------|------------|-------------|
| addRootTask | (row) | Triggered when adding a root task |
| addSubTask | (task) | Triggered when adding a subtask |
| removeTask | (task) | Triggered when removing a task |
| editTask | (task) | Triggered when editing a task |
| queryTask | (startDate, endDate, mode) | Triggered when querying tasks |
| barDate | (id, startDate, endDate) | Triggered when task date changes |
| allowChangeTaskDate | (allow) | Whether task date modification is allowed |
| updateProgress | (detail) | Triggered when progress is updated |

#### updateProgress Event Details

```typescript
interface ProgressUpdateDetail {
  taskId: any;        // Task ID
  oldProgress: number; // Old progress value (0-1)
  newProgress: number; // New progress value (0-1)
  task: object;       // Complete task object
}
```

## Task Data Format

```typescript
{
  id: '1',                              // Task ID
  pid: '0',                             // Parent task ID, '0' means root task
  taskNo: 'Project Planning Phase',     // Task name
  level: 'Important',                   // Priority
  start_date: '2024-12-01 08:00:00',   // Start time
  end_date: '2024-12-06 18:00:00',     // End time
  job_progress: '0.85',                // Progress (0-1)
  spend_time: null                     // Duration (auto-calculated)
}
```

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
| Finish-Start (FS) | FINISH_TO_START | Successor task starts after predecessor finishes |
| Start-Start (SS) | START_TO_START | Tasks start simultaneously |
| Finish-Finish (FF) | FINISH_TO_FINISH | Tasks finish simultaneously |
| Start-Finish (SF) | START_TO_FINISH | Predecessor finishes after successor starts |

### Configuration Example

```typescript
import { LinkType } from './components/gantt/Types';

dependencies: [
  // Task 2 starts after Task 1 finishes
  { sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START },
  
  // Task 3 and Task 4 start simultaneously
  { sourceTaskId: '3', targetTaskId: '4', type: LinkType.START_TO_START },
  
  // Task 5 and Task 6 must finish simultaneously
  { sourceTaskId: '5', targetTaskId: '6', type: LinkType.FINISH_TO_FINISH },
]
```

## View Modes

| Mode | Time Unit | Header Example | Use Case |
|------|-----------|----------------|----------|
| 🗓️ **Month** | Day | `01 02 03 04 05 ...` | Long-term project planning |
| 📅 **Day** | Day | `Mon Tue Wed ...` | Short-term task management |
| 📊 **Week** | Week | `W50 W51 W52 ...` | Mid-term project tracking |
| ⏰ **Hour** | Hour | `08 09 10 11 12 ...` | Precise task scheduling |

The component supports four time granularity views:

| Mode | Description | Use Case |
|------|-------------|----------|
| Month | Display by day, month unit | Long-term project planning |
| Day | Display by day, precise to day | Short-term task management |
| Week | Display by week | Mid-term project tracking |
| Hour | Display by hour | Precise task scheduling |

## Theme System

| Theme | Primary Color | Style Features |
|-------|---------------|----------------|
| 🔷 **Metro** | `#0078d4` | Microsoft Metro design language, professional metallic texture |
| 🌙 **Dark** | `#00d4ff` | Eye-friendly dark theme, suitable for extended use |
| ✨ **Modern** | `#6366f1` | Clean modern design, refreshing and comfortable |
| 💼 **Classic** | `#2563eb` | Traditional business style, stable and dignified |
| 🎨 **Colorful** | `#f59e0b` | Vibrant colorful theme, full of vitality |

### Built-in Themes

| Theme ID | Name | Description |
|----------|------|-------------|
| metro | Metro | Microsoft Metro design language |
| dark | Dark Mode | Eye-friendly dark theme |
| modern | Modern | Clean modern design |
| classic | Classic | Traditional business style |
| colorful | Colorful | Vibrant colorful theme |

### Switching Themes

A theme selector is provided in the top right corner of the component. Click to switch themes. Theme settings are automatically saved to localStorage.

### Custom Theme CSS Variables

```css
:root {
  --primary: #0078d4;           /* Primary color */
  --primary-dark: #106ebe;      /* Primary color dark */
  --primary-light: #1084d8;     /* Primary color light */
  --bg-content: #ffffff;        /* Content background color */
  --bg-metal-light: linear-gradient(145deg, #ffffff, #f5f5f5);
  --bg-metal-normal: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  --border: #d0d0d0;            /* Border color */
  --text-primary: #333333;      /* Primary text color */
  --text-secondary: #666666;    /* Secondary text color */
  --row-hover: #FFF3A1;         /* Row hover color */
  --font-family: 'Segoe UI', sans-serif;
}
```

## Internationalization Support

The component has a built-in complete internationalization (i18n) system, supporting bilingual switching between Chinese and English, and can easily extend more languages.

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

#### 1. Switch Language

In the top right corner of the Gantt chart toolbar, click the language selector to switch the interface language:

```typescript
import { setLocale } from './components/gantt/i18n';

// Switch to English
setLocale('en-US');

// Switch to Chinese
setLocale('zh-CN');
```

#### 2. Get Current Language

```typescript
import { getLocale } from './components/gantt/i18n';

const currentLang = getLocale(); // 'zh-CN' or 'en-US'
```

#### 3. Use Translation in Components

```vue
<script setup lang="ts">
import { useI18n } from './components/gantt/i18n';

const { t, locale } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <button>{{ t('common.confirm') }}</button>
    <p>{{ t('task.name') }}</p>
  </div>
</template>
```

### i18n Features

- ✅ **Instant Switching** - No page refresh required to switch languages
- ✅ **Auto Save** - Language selection automatically saved to browser localStorage
- ✅ **Complete Coverage** - All interface text has been translated
- ✅ **Dynamic Headers** - Timeline headers (months, weekdays, etc.) automatically formatted based on language
- ✅ **Type Safe** - TypeScript provides complete type support
- ✅ **Easy Extension** - Can easily add new language support

### Translated Interface Elements

#### Toolbar
- Date picker separator ("to" / "至")
- View mode buttons (Month/Week/Day/Hour)
- Link legend title and all link types

#### Task Headers
- No. (序号)
- Task Name (任务名称)
- Priority (优先级)
- Start Date (开始时间)
- End Date (结束时间)
- Duration (耗时)
- Progress (进度)

#### Timeline Headers
- Month names (January/一月, February/二月...)
- Weekday names (Monday/星期一, Tuesday/星期二...)
- Date format (01/01日, 02/02日...)
- Hour format (0:00/0点, 1:00/1点...)
- Week title (Week 1/第1周)

#### Configuration Panel
- Gantt configuration title
- Theme settings options
- All link configuration options
- All buttons and labels

### Adding New Languages

To add new language support, follow these steps:

1. Create a new language file in the `src/components/gantt/i18n/locales/` directory (e.g., `ja-JP.ts`)
2. Copy the structure from `zh-CN.ts` or `en-US.ts`
3. Translate all text
4. Import and register the new language in `src/components/gantt/i18n/index.ts`:

```typescript
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';
import frFR from './locales/fr-FR';
import deDE from './locales/de-DE';
import esES from './locales/es-ES';
import ruRU from './locales/ru-RU';

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,  // Added Japanese
  'ko-KR': koKR,  // Added Korean
  'fr-FR': frFR,  // Added French
  'de-DE': deDE,  // Added German
  'es-ES': esES,  // Added Spanish
  'ru-RU': ruRU   // Added Russian
};
```

5. Update the `getLocales()` function to add new language options

### Language Pack Structure

```typescript
export default {
  common: {        // Common text
    confirm: 'Confirm',
    cancel: 'Cancel',
    // ...
  },
  date: {          // Date and time
    year: 'Year',
    month: 'Month',
    // ...
  },
  viewMode: {      // View mode
    month: 'Month',
    week: 'Week',
    // ...
  },
  task: {          // Task related
    name: 'Task Name',
    priority: 'Priority',
    // ...
  },
  // More categories...
}
```


## Interactive Features

| Operation | Description | Effect |
|-----------|-------------|--------|
| 🖱️ **Drag & Move** | Drag entire task bar | Modify task start and end dates |
| 📏 **Resize** | Drag task bar left/right edges | Adjust task duration |
| 📊 **Progress Adjust** | Drag triangle slider at bottom of task bar | Adjust task completion progress |

### Task Bar Operations

- **Drag & Move** - Drag task bar to modify start and end dates
- **Resize** - Drag task bar left/right edges to adjust duration
- **Progress Adjust** - Drag triangle slider at bottom to adjust progress

### Parent-Child Task Linkage

- Moving parent tasks causes child tasks to move along
- Resizing parent tasks checks child task constraints
- Child tasks cannot start before parent tasks

### Quick Operations

- Click the **+** button in the top left to add root tasks
- Click the calendar icon to jump to today
- Right-click task rows to add subtasks, edit, or delete

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

```
Straight          Bezier Curve      Right Angle
┌─────┐          ┌─────┐          ┌─────┐
│Task A│ ────────▶│Task A│ ╭───────▶ │Task A│ ┐
└─────┘          └─────┘ ╰─┐       └─────┘ │
                          │                │
                      ┌─────┐          ┌─────┐
                      │Task B│          │Task B│
                      └─────┘          └─────┘
```

| Type | Enum | Description |
|------|------|-------------|
| Straight | STRAIGHT | Direct connection |
| Bezier Curve | BEZIER | Smooth curve |
| Right Angle | RIGHT_ANGLE | Right-angle connection |

## Performance Optimization

The component includes multiple performance optimizations:

- **Virtual Scrolling** - Only render tasks in the visible area
- **Throttled Updates** - Use throttling to avoid frequent re-renders when data changes
- **Cached Calculations** - Use computed to cache complex calculation results
- **On-Demand Rendering** - Calculate and render elements like links on demand

## Project Structure

```
src/
├── components/
│   └── gantt/
│       ├── Gantt.vue           # Main component
│       ├── Bar.vue             # Task bar component
│       ├── BarRecursionRow.vue # Recursive row component
│       ├── TaskLinks.vue       # Link component
│       ├── TimelineHeader.vue  # Timeline header
│       ├── TableContent.vue    # Table content
│       ├── RightTable.vue      # Right Gantt chart area
│       ├── SplitPane.vue       # Split panel
│       ├── DatePicker.vue      # Date picker
│       ├── GanttConfigPanel.vue    # Configuration panel
│       ├── GanttThemeSelector.vue  # Theme selector
│       ├── LanguageSelector.vue    # Language selector
│       ├── LinkConfigPanel.vue     # Link configuration panel
│       ├── Types.ts            # Type definitions
│       ├── Store.ts            # State management
│       ├── ShareState.ts       # Shared state
│       ├── LinkConfig.ts       # Link configuration
│       ├── Symbols.ts          # Injection symbols
│       ├── ZodSchema.ts        # Data validation
│       ├── i18n/               # Internationalization system
│       │   ├── index.ts        # i18n core
│       │   └── locales/        # Language packs
│       │       ├── zh-CN.ts    # Chinese language pack
│       │       ├── en-US.ts    # English language pack
│       │       ├── ja-JP.ts    # Japanese language pack
│       │       ├── ko-KR.ts    # Korean language pack
│       │       ├── fr-FR.ts    # French language pack
│       │       ├── de-DE.ts    # German language pack
│       │       ├── es-ES.ts    # Spanish language pack
│       │       └── ru-RU.ts    # Russian language pack
│       ├── task/               # Task-related components
│       │   ├── TaskTable.vue
│       │   ├── TaskHeader.vue
│       │   ├── TaskContent.vue
│       │   └── TaskRow.vue
│       └── themes/             # Theme configuration
│           └── GanttThemes.ts
├── App.vue                     # Example application
├── main.ts                     # Entry file
└── style.css                   # Global styles
```

## Complete Example

Refer to `src/App.vue` for a complete usage example, including:

- Multi-level task structure
- Various dependency configurations
- Custom color mapping
- Event handling
- Internationalization integration

## Browser Support

- Chrome (Recommended)
- Firefox
- Safari
- Edge

## License

MIT
