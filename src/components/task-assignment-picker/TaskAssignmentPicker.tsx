import * as React from 'react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  ModelPicker,
  type ModelPickerModel,
  type ModelPickerProvider,
} from '../model-picker/ModelPicker'

export interface TaskAssignmentTask {
  id: string
  label: string
  description?: string
  /** Rendered in an icon tile at the row's leading edge. */
  icon?: LucideIcon
  /** When set, the row's picker offers only models matching this capability. */
  requires?: string
  /** Render the fallback-model picker for this row (needs `onAssignSecondary`). */
  secondary?: boolean
}

export interface TaskAssignmentSection {
  id: string
  label: string
  /** Muted context line under the section label (e.g. what the rows mean). */
  description?: string
  /** Show the fallback picker on every task in the section (task-level wins). */
  secondary?: boolean
  tasks: TaskAssignmentTask[]
}

export interface TaskAssignmentPickerProps {
  /** Flat rendering; ignored when `sections` is set. */
  tasks?: TaskAssignmentTask[]
  /** Grouped rendering; when set, `tasks` is ignored. */
  sections?: TaskAssignmentSection[]
  providers: ModelPickerProvider[]
  /** Current mapping: taskId → modelId (null/undefined = unassigned). */
  value: Record<string, string | null>
  onAssign: (taskId: string, modelId: string | null) => void
  /** Enables fallback-model rows for tasks flagged (directly or via section). */
  secondaryValue?: Record<string, string | null>
  onAssignSecondary?: (taskId: string, modelId: string | null) => void
  secondaryLabel?: string
  /** App-rendered per-row context (inherit notes, spend, badges). */
  renderMeta?: (task: TaskAssignmentTask) => React.ReactNode
  unassignedLabel?: string
  clearLabel?: string
  modelLabel?: string
  disabled?: boolean
  className?: string
}

function filterProviders(
  providers: ModelPickerProvider[],
  requires: string | undefined,
): ModelPickerProvider[] {
  if (!requires) return providers
  const matches = (model: ModelPickerModel) =>
    model.capability === requires || (model.capabilities?.includes(requires) ?? false)
  return providers
    .map((provider) => ({
      ...provider,
      models: provider.models.filter(matches),
    }))
    .filter((provider) => provider.models.length > 0)
}

export const TaskAssignmentPicker = React.forwardRef<
  HTMLDivElement,
  TaskAssignmentPickerProps
>(function TaskAssignmentPicker(
  {
    tasks = [],
    sections,
    providers,
    value,
    onAssign,
    secondaryValue,
    onAssignSecondary,
    secondaryLabel = 'Fallback model',
    renderMeta,
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

  const renderRow = (task: TaskAssignmentTask, showSecondary: boolean) => {
    const assigned = modelName(value[task.id])
    const catalog = filterProviders(providers, task.requires)
    return (
      <div
        key={task.id}
        className="flex flex-col gap-2 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-3">
          {task.icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-muted)] text-[var(--as-muted-fg)]">
              <task.icon className="size-4" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--as-fg)]">
            {task.label}
          </p>
          {task.description ? (
            <p className="truncate text-xs text-[var(--as-muted-fg)]">
              {task.description}
            </p>
          ) : null}
          {renderMeta ? renderMeta(task) : null}
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
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showSecondary && onAssignSecondary ? (
            <ModelPicker
              providers={catalog}
              value={secondaryValue?.[task.id] ?? ''}
              onChange={(modelId) => onAssignSecondary(task.id, modelId)}
              disabled={disabled}
              clearable={Boolean(secondaryValue?.[task.id])}
              clearLabel={clearLabel}
              label={`${secondaryLabel} — ${task.label}`}
              className="w-48"
            />
          ) : null}
          <ModelPicker
            providers={catalog}
            value={value[task.id] ?? ''}
            onChange={(modelId) => onAssign(task.id, modelId)}
            disabled={disabled}
            clearable={Boolean(value[task.id])}
            clearLabel={clearLabel}
            label={`${modelLabel} — ${task.label}`}
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
  }

  return (
    <div
      ref={ref}
      data-as="task-assignment-picker"
      className={cn('flex w-full flex-col gap-3', className)}
    >
      {sections
        ? sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                  {section.label}
                </p>
                {section.description ? (
                  <p className="mt-0.5 text-xs text-[var(--as-muted-fg)]">
                    {section.description}
                  </p>
                ) : null}
              </div>
              {section.tasks.map((task) =>
                renderRow(task, section.secondary || Boolean(task.secondary)),
              )}
            </div>
          ))
        : tasks.map((task) => renderRow(task, Boolean(task.secondary)))}
    </div>
  )
})
