import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  ModelPicker,
  type ModelPickerProvider,
} from '../model-picker/ModelPicker'

export interface TaskAssignmentTask {
  id: string
  label: string
  description?: string
}

export interface TaskAssignmentPickerProps {
  tasks: TaskAssignmentTask[]
  providers: ModelPickerProvider[]
  /** Current mapping: taskId → modelId (null/undefined = unassigned). */
  value: Record<string, string | null>
  onAssign: (taskId: string, modelId: string | null) => void
  unassignedLabel?: string
  clearLabel?: string
  modelLabel?: string
  disabled?: boolean
  className?: string
}

/**
 * Task → model mapping list. Presentational: tasks, the model catalog and
 * the current mapping come in via props; changes go out via `onAssign`.
 */
export const TaskAssignmentPicker = React.forwardRef<
  HTMLDivElement,
  TaskAssignmentPickerProps
>(function TaskAssignmentPicker(
  {
    tasks,
    providers,
    value,
    onAssign,
    unassignedLabel = 'Not assigned',
    clearLabel = 'Clear assignment',
    modelLabel = 'Model',
    disabled = false,
    className,
  },
  ref,
) {
  const modelName = React.useCallback(
    (modelId: string | null | undefined) => {
      if (!modelId) return null
      for (const provider of providers) {
        const model = provider.models.find((m) => m.id === modelId)
        if (model) return { name: model.name, provider: provider.name }
      }
      return null
    },
    [providers],
  )

  return (
    <div
      ref={ref}
      data-as="task-assignment-picker"
      className={cn('flex w-full flex-col gap-3', className)}
    >
      {tasks.map((task) => {
        const assigned = modelName(value[task.id])
        return (
          <div
            key={task.id}
            className="flex flex-col gap-2 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--as-fg)]">
                {task.label}
              </p>
              {task.description ? (
                <p className="truncate text-xs text-[var(--as-muted-fg)]">
                  {task.description}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-[var(--as-muted-fg)]">
                {assigned ? (
                  <>
                    {modelLabel}:{' '}
                    <span className="font-medium text-[var(--as-fg)]">
                      {assigned.provider} / {assigned.name}
                    </span>
                  </>
                ) : (
                  unassignedLabel
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ModelPicker
                providers={providers}
                value={value[task.id] ?? ''}
                onChange={(modelId) => onAssign(task.id, modelId)}
                disabled={disabled}
                clearable={Boolean(value[task.id])}
                clearLabel={clearLabel}
                className="w-56"
              />
              {value[task.id] ? (
                <button
                  type="button"
                  aria-label={`${clearLabel} — ${task.label}`}
                  disabled={disabled}
                  onClick={() => onAssign(task.id, null)}
                  className="cursor-pointer rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-muted)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
})
