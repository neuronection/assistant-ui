import * as React from 'react'
import { cn } from '../../lib/utils'
import { SwitchRow } from '../switch-row/SwitchRow'

export interface SetupAssignmentRow {
  /** Stable row id (also the React key). */
  id: string
  /** The task the row assigns (e.g. "Chat default"). */
  label: string
  /** Muted sub-line under the label — the row's live context, e.g.
   * "now: unset · fills: gpt-5.6-terra". */
  hint?: React.ReactNode
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}

export interface SetupAssignmentsProps
  extends Omit<React.ComponentProps<'section'>, 'children'> {
  title: string
  /** One-line explanation under the title (what the switches do). */
  hint?: string
  rows: SetupAssignmentRow[]
}

/** The "Default assignments" section of the guided setup review: a titled,
 * hinted list of per-task switches in one bordered container. Each switch
 * fills that task's empty default — gap-fill semantics live app-side, the
 * rows only carry the choice. */
export const SetupAssignments = React.forwardRef<HTMLElement, SetupAssignmentsProps>(
  function SetupAssignments(
    { title, hint, rows, className, ...props },
    ref,
  ) {
    return (
      <section
        ref={ref}
        data-as="setup-assignments"
        className={cn('flex w-full flex-col gap-2', className)}
        {...props}
      >
        <div>
          <h3 className="text-sm font-semibold text-[var(--as-fg)]">{title}</h3>
          {hint ? (
            <p className="mt-0.5 text-xs text-[var(--as-muted-fg)]">{hint}</p>
          ) : null}
        </div>
        {rows.length > 0 ? (
          <div className="divide-y divide-[var(--as-border)] rounded-[var(--as-radius)] border border-[var(--as-border)]">
            {rows.map((row) => (
              <SwitchRow
                key={row.id}
                label={row.label}
                currentValue={row.hint}
                checked={row.checked}
                disabled={row.disabled}
                onCheckedChange={row.onCheckedChange}
                className="border-0 bg-transparent px-3"
              />
            ))}
          </div>
        ) : null}
      </section>
    )
  },
)
