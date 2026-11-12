import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SetupStep {
  /** Stable step id (also the React key). */
  id: string
  label: string
}

export interface SetupStepsProps
  extends Omit<React.ComponentProps<'ol'>, 'children'> {
  steps: SetupStep[]
  /** Zero-based index of the active step. An index past the last step
   * marks every step done (the wizard's completion state); a negative
   * index marks every step upcoming. */
  current: number
  /** Accessible name for the progress list. */
  label?: string
}

/** Two-plus-step wizard progress ("Connect" → "Choose defaults"): numbered
 * badges, a done check, the current step highlighted, hairline connectors.
 * The tiles and the key form are one mental unit (step 1); the review is
 * step 2 — the header makes that split visible before the user commits. */
export const SetupSteps = React.forwardRef<HTMLOListElement, SetupStepsProps>(
  function SetupSteps(
    { steps, current, label = 'Setup progress', className, ...props },
    ref,
  ) {
    if (steps.length === 0) return null
    return (
      <ol
        ref={ref}
        aria-label={label}
        data-as="setup-steps"
        className={cn('flex items-center gap-3', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const state =
            index < current ? 'done' : index === current ? 'current' : 'todo'
          return (
            <li
              key={step.id}
              aria-current={state === 'current' ? 'step' : undefined}
              className="flex items-center gap-3"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    state === 'current' &&
                      'bg-[var(--as-primary)] text-[var(--as-primary-fg)]',
                    state === 'done' &&
                      'bg-[var(--as-muted)] text-[var(--as-primary)]',
                    state === 'todo' &&
                      'border border-[var(--as-border)] text-[var(--as-muted-fg)]',
                  )}
                >
                  {state === 'done' ? (
                    <Check className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    state === 'current' && 'font-semibold text-[var(--as-fg)]',
                    state === 'done' && 'text-[var(--as-fg)]',
                    state === 'todo' && 'text-[var(--as-muted-fg)]',
                  )}
                >
                  {step.label}
                </span>
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="h-px w-8 bg-[var(--as-border)]"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    )
  },
)
