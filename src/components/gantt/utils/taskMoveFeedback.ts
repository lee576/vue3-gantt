import type {
  TaskMoveErrorDetail,
  TaskMoveEventHandlers,
  TaskMoveSettledDetail,
  TaskMoveStartDetail,
} from '../types/Types'

export type TaskMoveFeedbackLevel = 'success' | 'error' | 'warning'

export type TaskMoveFeedbackMessageResolver<TDetail> =
  | string
  | ((detail: TDetail) => string | null | undefined)

export interface CreateTaskMoveFeedbackHandlersOptions {
  notify: (message: string, level: TaskMoveFeedbackLevel) => void
  onStart?: (detail: TaskMoveStartDetail) => void
  onError?: (detail: TaskMoveErrorDetail) => void
  successMessage?: TaskMoveFeedbackMessageResolver<TaskMoveSettledDetail>
  rollbackMessage?: TaskMoveFeedbackMessageResolver<TaskMoveSettledDetail>
  staleMessage?: TaskMoveFeedbackMessageResolver<TaskMoveSettledDetail>
}

const DEFAULT_SUCCESS_MESSAGE = 'Task moved successfully'
const DEFAULT_ROLLBACK_MESSAGE = 'Task move failed and was rolled back'
const DEFAULT_STALE_MESSAGE = 'Task move result was stale and was ignored'

const resolveMessage = <TDetail>(
  resolver: TaskMoveFeedbackMessageResolver<TDetail> | undefined,
  fallback: string,
  detail: TDetail
) => {
  if (typeof resolver === 'function') {
    return resolver(detail)
  }

  return resolver ?? fallback
}

export const createTaskMoveFeedbackHandlers = (
  options: CreateTaskMoveFeedbackHandlersOptions
): Pick<TaskMoveEventHandlers, 'moveTaskStart' | 'moveTaskError' | 'moveTaskSettled'> => {
  return {
    moveTaskStart: detail => {
      options.onStart?.(detail)
    },
    moveTaskError: detail => {
      options.onError?.(detail)
    },
    moveTaskSettled: detail => {
      if (detail.accepted) {
        const message = resolveMessage(options.successMessage, DEFAULT_SUCCESS_MESSAGE, detail)
        if (message) {
          options.notify(message, 'success')
        }
        return
      }

      if (detail.rolledBack) {
        const message = resolveMessage(options.rollbackMessage, DEFAULT_ROLLBACK_MESSAGE, detail)
        if (message) {
          options.notify(message, 'error')
        }
        return
      }

      const message = resolveMessage(options.staleMessage, DEFAULT_STALE_MESSAGE, detail)
      if (message) {
        options.notify(message, 'warning')
      }
    },
  }
}
