# Vue3 Gantt Chart Component

**Languages:** [English](README.en-US.md) | [简体中文](README.md)

A feature-rich, highly customizable Vue 3 Gantt chart component that supports task management, dependency relationships, multiple view modes, and theme switching.

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

## Interface Preview

<div align="center">
  <img src="https://github.com/user-attachments/assets/34562bf8-0709-44aa-a05d-6e970ea8b57f" alt="Vue3 Gantt Chart - Light Theme" />
  <p><em>Light Theme - Complete Task Management Interface</em></p>
  
  <img src="https://github.com/user-attachments/assets/d6a60ba1-9f5b-479a-b402-68014ec7c935" alt="Vue3 Gantt Chart - Dark Theme" />
  <p><em>Dark Theme - Eye-friendly Mode</em></p>
</div>

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

**Key Highlights:**
- 🎯 **Dual-Column Layout** - Left task list + Right Gantt timeline, clear information at a glance
- 📊 **Visual Progress** - Real-time progress bars with drag-to-adjust completion
- 🔗 **Smart Dependencies** - Four dependency types (FS/SS/FF/SF) with auto-drawn links
- 🎨 **Multi-Theme** - 5 built-in themes, dark mode and custom theme support
- 🖱️ **Rich Interactions** - Drag move, resize, parent-child task linkage
- 🌍 **Internationalization** - Built-in 8 languages, easily extensible
- ⚡ **High Performance** - Virtual scrolling, handles massive task data effortlessly
- 💎 **Milestones** - Diamond markers for key nodes with dependency support

## ✨ Core Features

### 📅 Multiple View Modes
Four time granularities for different scenarios:
- **Month View** - Long-term project planning, displayed by day
- **Week View** - Medium-term project tracking, displayed by week
- **Day View** - Short-term task management, precise to day
- **Hour View** - Fine task scheduling, displayed by hour

### 🔗 Task Dependency Management
- **Finish-to-Start (FS)** - Successor task starts after predecessor finishes
- **Start-to-Start (SS)** - Both tasks start simultaneously
- **Finish-to-Finish (FF)** - Both tasks finish simultaneously
- **Start-to-Finish (SF)** - Predecessor finishes after successor starts

### 💎 Milestone Features
- Diamond icon markers for project key nodes
- Support as dependency source and target
- Auto-detect (start time = end time) or manual marking

### 🎨 Theme System
- 5 beautiful built-in themes (Metro/Dark/Modern/Classic/Colorful)
- Dark mode support, eye-friendly
- Complete CSS variable support, easy customization
- Theme settings auto-saved to browser

### 🌍 Internationalization
- Built-in 8 languages (CN/EN/JP/KR/FR/DE/ES/RU)
- Instant switching, no page refresh needed
- All UI elements fully translated
- Timeline headers auto-localized
- Easy to extend new languages

### 🖱️ Interactive Operations
- **Drag Move** - Modify task start and end dates
- **Resize** - Drag edges to adjust task duration
- **Progress Adjust** - Drag triangle slider to adjust completion
- **Parent-Child Linkage** - Child tasks follow when parent moves
- **Split Panel** - Adjustable left-right area ratio

### ⚡ Performance Optimization
- Virtual scroll rendering, supports massive task data
- Throttled updates, avoids frequent redraws
- Cached computations, improves response speed
- On-demand link rendering, optimized drawing performance

### 📝 Custom Fields
- **Multiple Field Types** - Supports text, number, date, dropdown selection field types
- **Flexible Configuration** - Add any number of custom fields to tasks
- **Form Validation** - Built-in field validation rules ensure data validity
- **Local Storage** - Field configuration automatically saved to browser, persists after refresh
- **Dynamic Management** - Add, edit, delete custom fields at runtime

### 💬 Message Toast
- **Three Alert Types** - Success, error, warning for different scenarios
- **Auto Dismiss** - Messages automatically disappear without manual closing
- **Elegant Animation** - Smooth enter and exit animation effects
- **Multi-language Support** - Alert text automatically switches with language settings

### 🗑️ Delete Confirmation
- **Safe Deletion** - Confirmation dialog before task deletion prevents accidental operations
- **Cascade Delete** - When deleting parent task, automatically prompts that all subtasks will be deleted
- **Friendly Prompts** - Clear warning messages inform users about deletion impact scope

### 🎛️ Configuration Panels
- **Link Style Configuration** - Customize task link path type, color, width, dashed style, arrow settings
- **Parent-Child Relationship Style** - Configure parent-child task connection line styles
- **Column Display Settings** - Flexibly control task list column show/hide
- **One-click Reset** - Quickly restore default configuration

### 🌲 Tree Task Structure
- **Hierarchy Display** - Clear tree structure showing task parent-child relationships
- **Collapse/Expand** - Support collapsing/expanding subtasks to simplify view
- **Connection Lines** - Visual connection lines showing hierarchy relationships
- **Quick Operations** - Inline buttons for quickly adding/deleting subtasks
- **Hover Highlight** - Mouse hover highlights current task row

## 🚀 Installation

### Option 1: Install via npm (Recommended)

```bash
# Using npm
npm install @lee576/vue3-gantt

# Or using yarn
yarn add @lee576/vue3-gantt

# Or using pnpm
pnpm add @lee576/vue3-gantt
```

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/lee576/vue3-gantt.git
cd vue3-gantt

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 Quick Start

### 1️⃣ Import Component

```typescript
import { createApp } from 'vue';
import Gantt from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';

const app = createApp(App);
app.use(Gantt); // Global registration
```

Or import in component:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig,
  LinkType 
} from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';
</script>
```

### 2️⃣ Configure Container Height (Important!)

> ⚠️ **Important**: The component **must have an explicit container height** to display properly.

**Recommended methods (choose one):**

```vue
<!-- Method 1: Use viewport height (Easiest) -->
<template>
  <div style="height: 100vh;">
    <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
  </div>
</template>

<!-- Method 2: Use fixed height -->
<template>
  <div style="height: 800px;">
    <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
  </div>
</template>

<!-- Method 3: Flex layout -->
<template>
  <div style="display: flex; flex-direction: column; height: 100vh;">
    <div>Header</div>
    <div style="flex: 1;"> <!-- Auto-fill remaining space -->
      <gantt :dataConfig="dataConfig" :styleConfig="styleConfig" />
    </div>
  </div>
</template>
```

<details>
<summary>💡 Why set height?</summary>

The component uses `height: 100%` internally. According to CSS specifications, percentage height requires the parent element to have an explicit height to calculate. Without a height on the parent container, the component will collapse.

**Solutions:**
- Use `100vh` (viewport height)
- Use fixed pixel value (e.g., `800px`)
- Use Flex layout's `flex: 1`
- Configure `html, body { height: 100%; }` then use `100%`

</details>

### 3️⃣ Basic Configuration

```vue
<template>
  <div style="height: 100vh;">
    <gantt 
      :dataConfig="dataConfig" 
      :styleConfig="styleConfig" 
      :eventConfig="eventConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import Gantt, { 
  type DataConfig, 
  type StyleConfig, 
  type EventConfig,
  LinkType 
} from '@lee576/vue3-gantt';
import '@lee576/vue3-gantt/style.css';

// 🎨 Style Configuration
const styleConfig = ref<StyleConfig>({
  headersHeight: 100,  // Header height
  rowHeight: 60,       // Row height
  setBarColor: (row) => {
    // Custom task bar colors
    const colorMap = { 'urgent': '#ef4444', 'important': '#3b82f6', 'normal': '#6b7280' };
    return colorMap[row.level] ?? '#000';
  }
});

// 📊 Data Configuration
const dataConfig = ref<DataConfig>({
  queryStartDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  queryEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
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
    { title: 'Task Name', width: 200, property: 'task', show: true },
    { title: 'Priority', width: 90, property: 'priority', show: true },
    { title: 'Start Date', width: 150, property: 'startdate', show: true },
    { title: 'End Date', width: 150, property: 'enddate', show: true },
  ]
});

// ⚡ Event Configuration
const eventConfig = ref<EventConfig>({
  queryTask: async (startDate, endDate, mode) => {
    // Query task data
    const tasks = await fetchTasks(startDate, endDate);
    dataConfig.value.dataSource = tasks;
  },
  barDate: (id, startDate, endDate) => {
    console.log('Task date changed', { id, startDate, endDate });
  },
  updateProgress: (detail) => {
    console.log('Progress updated', detail);
  }
});

// Initialize and load data
onMounted(() => {
  const start = dayjs().startOf('month').format('YYYY-MM-DD');
  const end = dayjs().endOf('month').format('YYYY-MM-DD');
  eventConfig.value.queryTask?.(start, end, 'month');
});
</script>
```

## 📖 Configuration Guide

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

### Regular Task

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

### Milestone Task

Milestones are key project checkpoints, displayed with diamond icons. The key characteristic is **start date equals end date**:

```typescript
{
  id: 'milestone-1',                   // Milestone ID
  pid: '0',                             // Parent task ID
  taskNo: '🎯 Requirements Complete', // Milestone name
  level: 'Urgent',                      // Priority
  start_date: '2024-12-02 18:00:00',   // Start time
  end_date: '2024-12-02 18:00:00',     // End time (same as start)
  job_progress: '1.0',                 // Milestones are usually 100%
  spend_time: null,
  type: 'milestone'                    // Optional: explicitly mark as milestone
}
```

**Milestone Recognition Rules**:
1. **Auto-detection**: Automatically displayed as diamond when `start_date === end_date`
2. **Explicit marking**: Set `type: 'milestone'` field
3. **Custom function**: Custom logic via `styleConfig.setTaskType`

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

#### Regular Task Dependencies

```typescript
import { LinkType } from './components/gantt/Types';

dependencies: [
  // Task 2 starts after Task 1 finishes
  { sourceTaskId: '1', targetTaskId: '2', type: LinkType.FINISH_TO_START },
  
  // Task 3 and Task 4 start together
  { sourceTaskId: '3', targetTaskId: '4', type: LinkType.START_TO_START },
  
  // Task 5 and Task 6 must finish together
  { sourceTaskId: '5', targetTaskId: '6', type: LinkType.FINISH_TO_FINISH },
]
```

#### Milestone Dependencies

Milestones support being **source** or **target** in dependency relationships:

```typescript
dependencies: [
  // Task completion → Milestone
  { sourceTaskId: 'task-5', targetTaskId: 'milestone-1', type: LinkType.FINISH_TO_START },
  
  // Milestone → Task starts
  { sourceTaskId: 'milestone-1', targetTaskId: 'task-6', type: LinkType.FINISH_TO_START },
  
  // Multiple tasks → Same milestone
  { sourceTaskId: 'frontend-dev', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
  { sourceTaskId: 'backend-dev', targetTaskId: 'milestone-2', type: LinkType.FINISH_TO_START },
]
```

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

## Custom Fields

The component supports powerful custom field functionality, allowing you to add any number of custom fields to tasks to meet different project personalization needs.

### Features

- **Multiple Field Types** - Text, number, date, dropdown selection
- **Dynamic Management** - Add, edit, delete fields at runtime
- **Form Validation** - Built-in validation rules ensure data validity
- **Local Storage** - Field configuration automatically saved to browser
- **Task Binding** - Custom field values associated with task data

### Field Types

| Type | Description | Example Value |
|------|-------------|---------------|
| Text | Single-line text input | "Project ID: PRJ-001" |
| Number | Numeric input, supports decimals | 100.5 |
| Date | Date picker | "2024-12-01" |
| Dropdown | Predefined option list | "High Priority" |

### Usage

#### 1. Open Custom Field Management

Click the "Custom Fields" button in the Gantt chart toolbar to open the field management dialog.

#### 2. Add Custom Field

```typescript
// Example: Add an "Owner" field
const customField = {
  id: 'field-1',
  name: 'Owner',
  type: 'text',      // text | number | date | select
  required: false,   // Whether required
  options: []        // Options for dropdown selection
};
```

#### 3. Use Custom Fields in Tasks

Custom field values are stored in the task's `customFieldValues` field:

```typescript
{
  id: '1',
  taskNo: 'Project Planning',
  start_date: '2024-12-01',
  end_date: '2024-12-06',
  job_progress: '0.85',
  customFieldValues: {
    'field-1': 'John Doe',           // Owner
    'field-2': '100',               // Budget
    'field-3': '2024-11-30',        // Approval Date
    'field-4': 'High Priority'      // Priority
  }
}
```

#### 4. Dropdown Field Configuration

```typescript
const priorityField = {
  id: 'field-priority',
  name: 'Priority',
  type: 'select',
  required: true,
  options: [
    { label: 'Urgent', value: 'urgent' },
    { label: 'Important', value: 'important' },
    { label: 'Normal', value: 'normal' }
  ]
};
```

### Field Validation

The component includes basic field validation rules:

- **Required Fields** - If field is marked as `required: true`, a value must be provided
- **Number Validation** - Number fields only accept valid numeric values
- **Date Validation** - Date fields only accept valid date formats
- **Option Validation** - Dropdown fields only accept predefined option values

### API Integration

#### Backend Storage Format

Custom field values need to be stored in the backend in a specific format:

```typescript
// Recommended format: JSON string
customFieldValues: JSON.stringify({
  'field-1': 'John Doe',
  'field-2': '100'
})

// Or array format (requires backend support)
customFieldValues: [
  { fieldId: 'field-1', value: 'John Doe' },
  { fieldId: 'field-2', value: '100' }
]
```

#### Data Processing Example

```typescript
// When saving task
const saveTask = async (task) => {
  const payload = {
    ...task,
    customFieldValues: JSON.stringify(task.customFieldValues)
  };
  await api.saveTask(payload);
};

// When loading task
const loadTask = async (taskId) => {
  const data = await api.getTask(taskId);
  return {
    ...data,
    customFieldValues: JSON.parse(data.customFieldValues || '{}')
  };
};
```

### Best Practices

1. **Field Naming** - Use clear, concise field names for easy understanding
2. **Required Settings** - Reasonably set required fields to avoid over-restriction
3. **Option Management** - Provide complete option lists for dropdown fields
4. **Data Validation** - Also validate fields in backend to ensure data integrity
5. **Performance Optimization** - Avoid adding too many custom fields that affect performance

## Configuration Panels

The component provides two powerful configuration panels for customizing Gantt chart display and behavior.

### Gantt Configuration Panel

Access via the "Gantt Config" button in the toolbar.

#### Language Settings

- **Language Selection** - Switch between Chinese (zh-CN) and English (en-US)
- **Auto-detection** - Automatically detects browser language on first load

#### Theme Settings

- **Light/Dark Mode** - Switch between light and dark themes
- **Theme Persistence** - Theme preference saved to local storage

#### Dependency Line Styles

Configure task dependency line appearance:

```typescript
{
  pathType: 'straight',      // Connection path type: straight | curved
  color: '#409EFF',         // Line color
  width: 2,                 // Line width (px)
  dashed: false,            // Whether to use dashed line
  showArrow: true,          // Whether to show arrow
  arrowSize: 6              // Arrow size (px)
}
```

**Path Types:**
- **Straight** - Direct straight line connection
- **Curved** - Smooth curved line connection

**Style Options:**
- **Color** - Supports any valid CSS color value
- **Width** - 1-5px recommended
- **Dashed** - Creates dashed line effect
- **Arrow** - Shows direction indicator at end point

### Column Configuration Panel

Access via the "Column Config" button in the toolbar.

#### Column Display Settings

Control which columns are visible in the task list:

```typescript
const columns = [
  { key: 'taskNo', label: 'Task Name', visible: true },
  { key: 'start_date', label: 'Start Date', visible: true },
  { key: 'end_date', label: 'End Date', visible: true },
  { key: 'job_progress', label: 'Progress', visible: true },
  { key: 'duration', label: 'Duration', visible: false }
];
```

#### Column Operations

- **Toggle Visibility** - Click checkbox to show/hide column
- **Show All** - Display all columns at once
- **Hide All** - Hide all columns at once
- **Reset Default** - Restore to default column configuration

#### Column Types

| Column Key | Description | Format |
|------------|-------------|--------|
| taskNo | Task name | Text |
| start_date | Start date | YYYY-MM-DD |
| end_date | End date | YYYY-MM-DD |
| job_progress | Progress percentage | 0-100% |
| duration | Task duration | Number (days) |

### Configuration Persistence

All configuration settings are automatically saved to browser local storage:

```typescript
// Storage keys
const CONFIG_KEYS = {
  ganttConfig: 'vue3-gantt-config',      // Gantt chart settings
  columnConfig: 'vue3-gantt-columns',    // Column display settings
  customFields: 'vue3-gantt-fields'      // Custom field definitions
};
```

**Benefits:**
- Settings persist across page refreshes
- Configuration shared across browser sessions
- Easy to reset to defaults if needed

### Best Practices

1. **Line Visibility** - Use contrasting colors for dependency lines
2. **Column Balance** - Don't show too many columns at once
3. **Theme Consistency** - Match Gantt chart theme with application theme
4. **Performance** - Complex line styles may impact performance with many tasks

## Task Dialog

The task dialog provides a comprehensive interface for creating and editing tasks with rich features.

### Dialog Features

- **Dual Mode** - Create new task or edit existing task
- **Form Validation** - Real-time validation with error messages
- **Custom Fields** - Support for dynamic custom field inputs
- **Date Constraints** - Automatic date validation and adjustment
- **Progress Control** - Visual progress slider with percentage display

### Basic Fields

#### Task Name

```typescript
{
  taskNo: 'Project Planning',  // Required, max length 200
  name: 'Project Planning'     // Display name (optional)
}
```

- **Required** - Yes
- **Max Length** - 200 characters
- **Validation** - Cannot be empty

#### Date Range

```typescript
{
  start_date: '2024-12-01',  // Start date
  end_date: '2024-12-06'     // End date
}
```

**Features:**
- **Date Picker** - Built-in date picker for easy selection
- **Auto-adjustment** - End date automatically adjusted if before start date
- **Format** - YYYY-MM-DD
- **Validation** - End date must be >= start date

#### Progress

```typescript
{
  job_progress: '0.85'  // Progress value (0-1)
}
```

**Features:**
- **Slider Control** - Visual slider for easy adjustment
- **Percentage Display** - Shows progress as percentage (0-100%)
- **Decimal Support** - Supports decimal values (e.g., 0.5 = 50%)
- **Validation** - Must be between 0 and 1

### Custom Fields Section

The dialog dynamically renders custom fields based on configuration:

```typescript
// Example custom fields in dialog
const customFields = [
  {
    id: 'field-1',
    name: 'Owner',
    type: 'text',
    value: 'John Doe'
  },
  {
    id: 'field-2',
    name: 'Budget',
    type: 'number',
    value: '10000'
  },
  {
    id: 'field-3',
    name: 'Priority',
    type: 'select',
    options: [
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' }
    ],
    value: 'high'
  }
];
```

**Field Types:**
- **Text Input** - Single-line text field
- **Number Input** - Numeric field with validation
- **Date Picker** - Date selection field
- **Dropdown** - Select from predefined options

### Form Validation

The dialog implements comprehensive validation:

```typescript
// Validation rules
const rules = {
  taskNo: [
    { required: true, message: 'Task name is required' },
    { max: 200, message: 'Task name cannot exceed 200 characters' }
  ],
  start_date: [
    { required: true, message: 'Start date is required' }
  ],
  end_date: [
    { required: true, message: 'End date is required' },
    { 
      validator: (rule, value, callback) => {
        if (value < start_date) {
          callback(new Error('End date must be after start date'));
        } else {
          callback();
        }
      }
    }
  ]
};
```

**Validation Types:**
- **Required Fields** - Ensures mandatory fields are filled
- **Format Validation** - Validates date and number formats
- **Business Rules** - Enforces logical constraints (e.g., end >= start)
- **Custom Field Validation** - Validates based on field type and requirements

### Dialog Actions

#### Save Button

- Validates all fields before saving
- Shows error messages if validation fails
- Emits save event with task data
- Closes dialog on successful save

#### Cancel Button

- Closes dialog without saving
- Discards any unsaved changes
- No confirmation required

### Best Practices

1. **Clear Naming** - Use descriptive task names
2. **Date Planning** - Set realistic date ranges
3. **Progress Updates** - Regularly update progress values
4. **Custom Fields** - Use custom fields for project-specific data
5. **Validation** - Pay attention to validation messages

## Message Toast

The component includes a built-in message toast system for providing user feedback.

### Message Types

Three types of messages are supported:

| Type | Icon | Color | Usage |
|------|------|-------|-------|
| Success | ✓ | Green | Successful operations (save, delete, etc.) |
| Error | ✗ | Red | Failed operations (validation errors, API errors) |
| Warning | ⚠ | Orange | Warnings (unsaved changes, potential issues) |

### Usage

#### Display Success Message

```typescript
// In component
import { useMessage } from '@/composables/useMessage';

const { showMessage } = useMessage();

// Show success message
showMessage('Task saved successfully', 'success');
```

#### Display Error Message

```typescript
// Show error message
showMessage('Failed to save task: Invalid data', 'error');
```

#### Display Warning Message

```typescript
// Show warning message
showMessage('Unsaved changes will be lost', 'warning');
```

### Message Behavior

**Auto-dismissal:**
- Success messages: 3 seconds
- Error messages: 5 seconds
- Warning messages: 4 seconds

**Manual Dismissal:**
- Click message to dismiss immediately
- Hover to pause auto-dismissal timer

**Positioning:**
- Top-right corner of screen
- Stacked vertically for multiple messages
- Maximum 3 messages displayed simultaneously

### Message Queue

The toast system manages a message queue:

```typescript
// Message queue properties
interface Message {
  id: string;           // Unique message ID
  type: 'success' | 'error' | 'warning';
  content: string;      // Message text
  duration: number;     // Display duration (ms)
  timestamp: number;    // Creation timestamp
}
```

**Queue Management:**
- New messages added to end of queue
- Oldest messages dismissed first
- Prevents duplicate messages

### Styling

Messages are styled according to type:

```css
/* Success message */
.message-success {
  background: #f0f9ff;
  border-left: 4px solid #67c23a;
  color: #67c23a;
}

/* Error message */
.message-error {
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
  color: #f56c6c;
}

/* Warning message */
.message-warning {
  background: #fdf6ec;
  border-left: 4px solid #e6a23c;
  color: #e6a23c;
}
```

### Best Practices

1. **Clear Messages** - Use clear, concise message text
2. **Appropriate Types** - Choose correct message type for situation
3. **User Feedback** - Provide feedback for all user actions
4. **Error Details** - Include helpful information in error messages
5. **Avoid Spam** - Don't show too many messages in short time

## Delete Confirmation Dialog

The delete confirmation dialog ensures safe task deletion with clear warnings and options.

### Dialog Features

- **Warning Display** - Shows clear warning about deletion consequences
- **Cascade Warning** - Informs about child task deletion
- **Confirmation Required** - Prevents accidental deletions
- **Action Buttons** - Clear confirm and cancel options

### Dialog Content

#### Warning Message

```
⚠️ Warning: You are about to delete this task
```

#### Cascade Warning (for parent tasks)

```
Note: This will also delete all child tasks under this task.
Are you sure you want to continue?
```

#### Confirmation Question

```
Are you sure you want to delete this task?
```

### Dialog Actions

#### Confirm Button

- **Text** - "Confirm" or "Delete"
- **Style** - Red/danger color to indicate destructive action
- **Action** - Deletes task and all child tasks (if any)
- **Feedback** - Shows success message after deletion

#### Cancel Button

- **Text** - "Cancel"
- **Style** - Gray/neutral color
- **Action** - Closes dialog without deleting
- **Feedback** - No action taken

### Deletion Behavior

#### Simple Task Deletion

When deleting a task without children:

```typescript
// Single task deletion
const deleteTask = (taskId: string) => {
  // 1. Show confirmation dialog
  // 2. User confirms
  // 3. Delete task from data
  // 4. Show success message
  // 5. Update UI
};
```

#### Parent Task Deletion

When deleting a task with children:

```typescript
// Parent task with children
const deleteTaskWithChildren = (taskId: string) => {
  // 1. Show confirmation dialog with cascade warning
  // 2. User confirms
  // 3. Delete all child tasks recursively
  // 4. Delete parent task
  // 5. Show success message
  // 6. Update UI
};
```

**Cascade Deletion:**
- All child tasks are deleted
- Child tasks' children are also deleted
- Entire subtree is removed from data

### Safety Features

#### Double Confirmation

For critical deletions, the dialog may require additional confirmation:

```typescript
// Example: Delete task with many children
if (childCount > 10) {
  // Show additional confirmation step
  const confirmed = await showDoubleConfirmation();
  if (!confirmed) return;
}
```

#### Undo Support (Optional)

The component can be extended to support undo:

```typescript
// Store deleted tasks for potential undo
const deletedTasks = [];

const deleteTask = (task) => {
  // Save task before deletion
  deletedTasks.push({
    task: task,
    timestamp: Date.now()
  });
  
  // Perform deletion
  performDeletion(task.id);
};

const undoDelete = () => {
  const lastDeleted = deletedTasks.pop();
  if (lastDeleted) {
    restoreTask(lastDeleted.task);
  }
};
```

### Best Practices

1. **Clear Warnings** - Always show clear warnings before deletion
2. **Cascade Info** - Inform users about child task deletion
3. **Confirmation** - Always require confirmation for deletion
4. **Feedback** - Show success message after deletion
5. **Recovery** - Consider implementing undo functionality

## Tree Task Structure

The component supports hierarchical task tree structure with rich visualization and interaction features.

### Core Features

- **Multi-level Hierarchy** - Support unlimited task nesting levels
- **Visual Indentation** - Clear visual representation of task hierarchy
- **Connection Lines** - Tree-style connection lines between parent and child tasks
- **Expand/Collapse** - Interactive expand/collapse for parent tasks
- **Task Numbering** - Hierarchical task numbering (1, 1.1, 1.1.1, etc.)
- **Inline Operations** - Add/delete child tasks directly from task row

### Task Hierarchy Structure

Tasks can be organized in a tree structure:

```typescript
// Example task hierarchy
const tasks = [
  {
    id: '1',
    taskNo: 'Project Phase 1',
    level: 0,           // Root level
    children: [
      {
        id: '1-1',
        taskNo: 'Task 1.1',
        level: 1,       // First level child
        children: [
          {
            id: '1-1-1',
            taskNo: 'Task 1.1.1',
            level: 2    // Second level child
          }
        ]
      },
      {
        id: '1-2',
        taskNo: 'Task 1.2',
        level: 1
      }
    ]
  }
];
```

**Level Properties:**
- `level: 0` - Root task (no parent)
- `level: 1` - First level child
- `level: 2` - Second level child
- And so on...

### Visual Elements

#### Indentation

Each level of hierarchy is indented by a fixed amount:

```css
/* Indentation per level */
.task-row {
  padding-left: calc(level * 24px);
}
```

**Visual Effect:**
- Level 0: No indentation
- Level 1: 24px indentation
- Level 2: 48px indentation
- Level 3: 72px indentation

#### Connection Lines

Tree-style connection lines show parent-child relationships:

```
├─ Task 1.0 (parent)
│  ├─ Task 1.1 (child)
│  │  ├─ Task 1.1.1 (grandchild)
│  │  └─ Task 1.1.2 (grandchild)
│  └─ Task 1.2 (child)
└─ Task 2.0 (parent)
```

**Line Types:**
- **Vertical Line** - Connects parent to children
- **Horizontal Line** - Connects to task name
- **Corner** - Smooth corner at connection point

#### Expand/Collapse Icons

Parent tasks display expand/collapse indicators:

- **Expanded (▾)** - Shows children, click to collapse
- **Collapsed (▸)** - Hides children, click to expand
- **Leaf Task** - No icon (no children)

### Interaction Operations

#### Expand/Collapse Tasks

Click the expand/collapse icon to toggle visibility:

```typescript
// Expand task
const expandTask = (taskId: string) => {
  const task = findTask(taskId);
  if (task) {
    task.expanded = true;
    // Show all child tasks
  }
};

// Collapse task
const collapseTask = (taskId: string) => {
  const task = findTask(taskId);
  if (task) {
    task.expanded = false;
    // Hide all child tasks
  }
};
```

**Keyboard Support:**
- `Right Arrow` - Expand task
- `Left Arrow` - Collapse task

#### Add Child Task

Click the "+" button on a task row to add a child:

```typescript
const addChildTask = (parentTaskId: string) => {
  const parentTask = findTask(parentTaskId);
  if (parentTask) {
    const newTask = {
      id: generateId(),
      taskNo: 'New Task',
      level: parentTask.level + 1,
      parentId: parentTaskId
    };
    parentTask.children.push(newTask);
    // Auto-expand parent to show new child
    parentTask.expanded = true;
  }
};
```

#### Delete Task

Click the "×" button to delete a task:

```typescript
const deleteTask = (taskId: string) => {
  // Show confirmation dialog
  const confirmed = showDeleteConfirmation(taskId);
  if (confirmed) {
    // Delete task and all children
    removeTaskAndChildren(taskId);
  }
};
```

**Cascade Deletion:**
- Deleting a parent task deletes all its children
- Deleting a child task only deletes that child
- Confirmation dialog warns about cascade deletion

### Parent-Child Task Linkage

#### Date Constraints

Child task dates are constrained by parent task dates:

```typescript
// Child task cannot extend beyond parent
const validateChildDates = (child: Task, parent: Task) => {
  if (child.start_date < parent.start_date) {
    child.start_date = parent.start_date;
  }
  if (child.end_date > parent.end_date) {
    child.end_date = parent.end_date;
  }
};
```

**Rules:**
- Child start date >= Parent start date
- Child end date <= Parent end date
- Parent dates automatically adjust if needed

#### Progress Calculation

Parent task progress is calculated from children:

```typescript
// Calculate parent progress from children
const calculateParentProgress = (parent: Task) => {
  if (!parent.children || parent.children.length === 0) {
    return parent.job_progress;
  }
  
  const totalProgress = parent.children.reduce((sum, child) => {
    return sum + parseFloat(child.job_progress);
  }, 0);
  
  return (totalProgress / parent.children.length).toFixed(2);
};
```

**Calculation Method:**
- Average of all child task progress
- Automatically updates when child progress changes
- Can be overridden manually

### Style Customization

#### Indentation Width

Customize indentation per level:

```typescript
const config = {
  indentationWidth: 24  // px per level
};
```

#### Line Styles

Customize connection line appearance:

```css
.tree-line {
  color: #dcdfe6;        /* Line color */
  width: 1px;            /* Line width */
  style: solid;          /* Line style */
}
```

#### Icon Styles

Customize expand/collapse icons:

```css
.expand-icon {
  color: #909399;        /* Icon color */
  font-size: 14px;       /* Icon size */
  cursor: pointer;       /* Pointer cursor */
}

.expand-icon:hover {
  color: #409EFF;        /* Hover color */
}
```

### Best Practices

1. **Shallow Hierarchy** - Keep hierarchy depth reasonable (3-5 levels max)
2. **Clear Naming** - Use descriptive names at each level
3. **Logical Grouping** - Group related tasks under same parent
4. **Regular Review** - Periodically review and reorganize structure
5. **Consistent Indentation** - Maintain consistent indentation for clarity

## Internationalization Support

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
