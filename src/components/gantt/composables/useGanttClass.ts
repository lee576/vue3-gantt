import { computed } from 'vue'

export function useGanttClass() {
  function mergeClasses(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
  }

  function conditionalClass(condition: boolean, trueClass: string, falseClass: string = ''): string {
    return condition ? trueClass : falseClass
  }

  function responsiveClass(breakpoint: string, baseClass: string, responsiveClass: string): string {
    return `${baseClass} ${breakpoint}:${responsiveClass}`
  }

  const baseContainerClasses = computed(() =>
    mergeClasses(
      'relative',
      'w-full',
      'h-full',
      'bg-gantt-bg',
      'dark:bg-gantt-bg-dark',
      'rounded-lg',
      'border',
      'border-gantt-border',
      'overflow-hidden'
    )
  )

  const baseToolbarClasses = computed(() =>
    mergeClasses(
      'flex',
      'items-center',
      'justify-between',
      'p-4',
      'bg-white',
      'dark:bg-gray-800',
      'border-b',
      'border-gantt-border'
    )
  )

  const baseTableClasses = computed(() =>
    mergeClasses(
      'flex',
      'flex-col',
      'h-full',
      'overflow-hidden'
    )
  )

  const baseBarClasses = computed(() =>
    mergeClasses(
      'h-gantt-bar',
      'bg-gantt-primary',
      'rounded',
      'transition-all',
      'duration-200',
      'hover:opacity-80'
    )
  )

  return {
    mergeClasses,
    conditionalClass,
    responsiveClass,
    baseContainerClasses,
    baseToolbarClasses,
    baseTableClasses,
    baseBarClasses,
  }
}
