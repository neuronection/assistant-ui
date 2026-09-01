import * as React from 'react'
import { Cpu, Star, X } from 'lucide-react'
import { InfoButton } from '../info-button/InfoButton'
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
  /** Compact badge text for the primary picker (default "Primary"). */
  primaryLabel?: string
  /** Info-popup content for the primary picker (rendered when set). */
  primaryInfo?: React.ReactNode
  /** Info-popup content for the fallback picker (rendered when set). */
  fallbackInfo?: React.ReactNode
  /** App-rendered per-row context (inherit notes, spend, badges). */
  renderMeta?: (task: TaskAssignmentTask) => React.ReactNode
  clearLabel?: string
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
    secondaryLabel = 'Fallback',
    primaryLabel = 'Primary',
    primaryInfo,
    fallbackInfo,
    renderMeta,
    clearLabel = 'Clear assignment',
    disabled = false,
    className,
  },
  ref,
) {
  const renderRow = (task: TaskAssignmentTask, showSecondary: boolean) => {
    const catalog = filterProviders(providers, task.requires)
    return (
      <div
        key={task.id}
        className="flex flex-col gap-2 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-muted)] text-[var(--as-muted-fg)]">
            {(() => {
              const Icon = task.icon ?? Cpu
              return <Icon className="size-4" aria-hidden />
            })()}
          </span>
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
          </div>
        </div>
        {showSecondary && onAssignSecondary ? (
          <div className="flex shrink-0 flex-col items-start gap-2 self-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--as-muted-fg)]">
                {secondaryLabel}
              </span>
              <ModelPicker
                providers={catalog}
                value={secondaryValue?.[task.id] ?? ''}
                onChange={(modelId) => onAssignSecondary(task.id, modelId)}
                disabled={disabled}
                clearable={false}
                clearLabel={clearLabel}
                label={`${secondaryLabel} — ${task.label}`}
                hideLabel
                className="w-52"
              />
              {fallbackInfo ? (
                <InfoButton label={`${secondaryLabel} — ${task.label}`}>{fallbackInfo}</InfoButton>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--as-muted-fg)]">
                <Star className="size-2.5" aria-hidden />
                {primaryLabel}
              </span>
              <ModelPicker
                providers={catalog}
                value={value[task.id] ?? ''}
                onChange={(modelId) => onAssign(task.id, modelId)}
                disabled={disabled}
                clearable={false}
                clearLabel={clearLabel}
                label={task.label}
                hideLabel
                className="w-52"
              />
              {primaryInfo ? (
                <InfoButton label={`${primaryLabel} — ${task.label}`}>{primaryInfo}</InfoButton>
              ) : null}
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
        ) : (
          <div className="flex items-center gap-1.5 self-center">
            <ModelPicker
              providers={catalog}
              value={value[task.id] ?? ''}
              onChange={(modelId) => onAssign(task.id, modelId)}
              disabled={disabled}
              clearable={false}
              clearLabel={clearLabel}
              label={task.label}
              hideLabel
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
        )}
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
