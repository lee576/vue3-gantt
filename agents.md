# Project: Vue3 Gantt

A powerful, performant, and feature-rich Gantt chart component built with Vue 3 and TypeScript.

## Tech Stack

- **Framework**: Vue 3 (Composition API + Script Setup)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Variables
- **Testing**: Vitest
- **State Management**: Vue Reactive (Store pattern)

## Project Structure

```
src/
├── components/gantt/
│   ├── composables/          # Reusable composition functions
│   ├── config/               # Configuration panels and settings
│   ├── core/                 # Core components (Gantt.vue, SplitPane.vue)
│   ├── features/             # Feature modules (Baseline, Critical Path, etc.)
│   ├── i18n/locales/         # Internationalization files
│   ├── links/                # Task dependency links
│   ├── state/                # State management (Store.ts)
│   ├── task/                 # Task row and task table components
│   ├── themes/               # Theme definitions and styles
│   ├── timeline/             # Timeline components (bars, milestones, header)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── workers/              # Web Worker modules for performance
├── composables/              # Global composables
├── locales/                  # Global locales
├── mock/                     # Mock data
├── services/                 # API services
├── styles/                   # Shared styles
└── types/                    # Global type definitions
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Preview build
pnpm preview
```

## Key Features

- **Task Management**: Create, edit, delete tasks with various types (task, milestone, project)
- **Dependencies**: Define task dependencies (FF, FS, SS, SF) with validation
- **Baseline**: Save and compare task schedules
- **Critical Path**: Analyze and highlight critical path
- **Virtual Scroll**: Horizontal and vertical virtualization for performance
- **Web Workers**: Offload heavy computations to background threads
- **Internationalization**: Support for 9 languages
- **Themes**: Multiple built-in themes with custom theme support
- **Custom Fields**: Add and manage custom task fields
- **Constraint Validation**: Task date and dependency constraints

## Code Conventions

- Use Composition API + Script Setup for Vue components
- Follow TypeScript strict mode
- Component files: PascalCase (e.g., `GanttConfigPanel.vue`)
- Utility files: camelCase (e.g., `dateUtils.ts`)
- Composables: prefix with `use` (e.g., `useTaskManagement.ts`)
- Types: define in `types/` directory, use Zod for runtime validation
- CSS: use Tailwind utility classes + CSS variables for theming
- No comments unless explaining complex logic

## Important Files

- [src/components/gantt/core/Gantt.vue](file:///d:/IloveCode/vue3-gantt/vue3-gantt-1/src/components/gantt/core/Gantt.vue) - Main Gantt component
- [src/components/gantt/state/Store.ts](file:///d:/IloveCode/vue3-gantt/vue3-gantt-1/src/components/gantt/state/Store.ts) - State management
- [src/components/gantt/timeline/Bar.vue](file:///d:/IloveCode/vue3-gantt/vue3-gantt-1/src/components/gantt/timeline/Bar.vue) - Task bar component
- [src/components/gantt/workers/WorkerManager.ts](file:///d:/IloveCode/vue3-gantt/vue3-gantt-1/src/components/gantt/workers/WorkerManager.ts) - Web Worker orchestration

## Performance Considerations

- Use virtual scrolling for large datasets
- Heavy computations should use Web Workers
- Memoize expensive calculations
- Use `shallowRef` for large reactive objects
- Avoid deep reactivity on large data structures
