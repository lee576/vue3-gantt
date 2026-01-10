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

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>Generates algorithmic visual art using Python. When users want to create visual artwork programmatically, such as generative patterns, data visualizations, or creative code-based art.</description>
<location>project</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Creates brand guideline documents from source materials. When users need to extract, consolidate, and format brand guidelines from various source materials into a comprehensive document.</description>
<location>project</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Designs canvas-based visual assets using Python. When users need to create visual assets, diagrams, or illustrations programmatically, often as PNG/SVG outputs.</description>
<location>project</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Co-authors documentation with a human. When the user wants to collaboratively write documentation together in a pair programming style, iterating on content in real-time.</description>
<location>project</location>
</skill>

<skill>
<name>docx</name>
<description>Creates and edits Microsoft Word (.docx) documents. When Claude needs to generate, modify, or analyze Word documents programmatically.</description>
<location>project</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Designs frontend web applications and websites. When users want to design and build a frontend web application or website, including UI/UX design and implementation.</description>
<location>project</location>
</skill>

<skill>
<name>internal-comms</name>
<description>Drafts internal communications for organizations. When users need help drafting emails, memos, announcements, or other internal company communications.</description>
<location>project</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Builds Model Context Protocol (MCP) servers and clients. When users want to create MCP servers to expose local tools and resources to Claude, or build MCP clients to integrate with external services.</description>
<location>project</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>project</location>
</skill>

<skill>
<name>pptx</name>
<description>Creates Microsoft PowerPoint (.pptx) presentations. When users need to generate PowerPoint presentations programmatically for reports, pitch decks, or presentations.</description>
<location>project</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>project</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Creates animated GIF images for Slack. When users want to create custom animated GIFs to use as Slack reactions, status updates, or custom emoji.</description>
<location>project</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Creates themes for web apps and platforms. When users want to create or customize themes for websites, web applications, or design systems.</description>
<location>project</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Builds web artifacts like websites, apps, and design files. When users want to create standalone web-based artifacts such as landing pages, interactive prototypes, or design mockups.</description>
<location>project</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Tests web applications and creates bug reports. When users want to test a web application, identify bugs or issues, and generate detailed bug reports with reproduction steps.</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>Creates and edits Microsoft Excel (.xlsx) spreadsheets. When users need to generate, modify, or analyze Excel spreadsheets programmatically, including charts and formatting.</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
