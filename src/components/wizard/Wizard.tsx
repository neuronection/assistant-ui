import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Sparkles, X, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export interface StepperStep {
  id: string
  label?: React.ReactNode
  icon?: LucideIcon
}

export interface StepperProps {
  steps: StepperStep[]
  current: number
  variant?: 'dots' | 'labels'
  onStepClick?: (index: number) => void
  className?: string
}

export function Stepper({
  steps,
  current,
  variant = 'dots',
  onStepClick,
  className,
}: StepperProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1.5', className)} data-as="stepper">
        <span className="sr-only">
          Step {Math.min(current + 1, steps.length)} of {steps.length}
        </span>
        <div className="flex items-center gap-1.5" aria-hidden>
          {steps.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                'size-2 rounded-full',
                index === current
                  ? 'bg-[var(--as-primary)]'
                  : index < current
                    ? 'bg-[var(--as-primary)]/50'
                    : 'bg-[var(--as-border)]',
              )}
            />
          ))}
        </div>
      </div>
    )
  }
  return (
    <ol className={cn('flex items-center gap-1', className)} data-as="stepper">
      {steps.map((step, index) => {
        const Icon = step.icon
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        const disabled = onStepClick === undefined || state === 'current'
        return (
          <li key={step.id}>
            <button
              type="button"
              aria-current={state === 'current' ? 'step' : undefined}
              disabled={disabled}
              onClick={() => onStepClick?.(index)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-[var(--as-radius)] px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:cursor-default',
                state === 'current' && 'bg-[var(--as-primary)]/10 font-medium text-[var(--as-primary)]',
                state === 'done' && 'text-[var(--as-fg)] hover:bg-[var(--as-secondary)]',
                state === 'todo' && 'text-[var(--as-muted-fg)] hover:bg-[var(--as-secondary)]',
              )}
            >
              {Icon ? <Icon className="size-4" aria-hidden /> : null}
              {step.label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export interface WizardStep {
  id: string
  icon?: LucideIcon
  title?: React.ReactNode
  subtitle?: React.ReactNode
  canContinue?: boolean
  nextLabel?: string
  hideFooter?: boolean
}

export interface WizardContext {
  id: string
  index: number
  step: WizardStep
  isFirst: boolean
  isLast: boolean
  next: () => void
  back: () => void
  goTo: (index: number) => void
}

export interface WizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  steps: WizardStep[]
  renderStep: (ctx: WizardContext) => React.ReactNode
  initialStep?: number
  step?: number
  onStepChange?: (index: number) => void
  onSkip?: () => void
  skipLabel?: string | null
  backLabel?: string
  nextLabel?: string
  getStartedLabel?: string
  closeLabel?: string
  variant?: 'modal' | 'drawer'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contentClassName?: string
}

export function Wizard({
  open,
  onOpenChange,
  title,
  steps,
  renderStep,
  initialStep = 0,
  step: stepProp,
  onStepChange,
  onSkip,
  skipLabel = 'Skip',
  backLabel = 'Back',
  nextLabel = 'Next',
  getStartedLabel = 'Get started',
  closeLabel = 'Close',
  variant = 'modal',
  size = 'lg',
  contentClassName,
}: WizardProps) {
  const [internalStep, setInternalStep] = React.useState(initialStep)
  const isControlled = stepProp !== undefined
  const step = isControlled ? stepProp : internalStep
  const lastStep = Math.max(steps.length - 1, 0)
  const clamped = Math.min(Math.max(step, 0), lastStep)
  const current: WizardStep | undefined = steps[clamped]
  const StepIcon = current?.icon ?? Sparkles

  React.useEffect(() => {
    if (!open && !isControlled) {
      setInternalStep(initialStep)
    }
  }, [open, isControlled, initialStep])

  const goTo = React.useCallback(
    (index: number) => {
      const next = Math.min(Math.max(index, 0), lastStep)
      if (!isControlled) {
        setInternalStep(next)
      }
      onStepChange?.(next)
    },
    [isControlled, lastStep, onStepChange],
  )

  const ctx: WizardContext = {
    id: current?.id ?? '',
    index: clamped,
    step: current ?? { id: 'empty' },
    isFirst: clamped === 0,
    isLast: clamped === lastStep,
    next: () => goTo(clamped + 1),
    back: () => goTo(clamped - 1),
    goTo,
  }

  const skip = onSkip ?? (() => onOpenChange(false))
  const showFooter = !(current?.hideFooter ?? clamped === lastStep)
  const canContinue = current?.canContinue !== false

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-as="wizard-overlay"
          className="as-anim-fade fixed inset-0 z-[var(--as-z-modal)] bg-[var(--as-overlay)]"
        />
        <DialogPrimitive.Content
          data-as="wizard"
          aria-describedby={undefined}
          className={cn(
            'flex flex-col overflow-hidden border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)] focus:outline-none',
            variant === 'drawer'
              ? 'as-anim-drawer fixed inset-y-0 right-0 z-[var(--as-z-modal)] h-full w-4/5 max-w-md border-l'
              : 'as-anim-modal fixed left-1/2 top-1/2 z-[var(--as-z-modal)] max-h-[92vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--as-radius-lg)]',
            variant === 'modal' &&
              cn(
                size === 'sm' && 'max-w-sm',
                size === 'md' && 'max-w-md',
                size === 'lg' && 'max-w-2xl',
                size === 'xl' && 'max-w-4xl',
              ),
            contentClassName,
          )}
        >
          <div className="flex items-center gap-3 border-b border-[var(--as-border)] px-5 py-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-primary)]/10 text-[var(--as-primary)]">
              <StepIcon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="truncate text-sm font-semibold">
                {title}
              </DialogPrimitive.Title>
              {current?.subtitle !== undefined ? (
                <p className="truncate text-xs text-[var(--as-muted-fg)]">
                  {current.subtitle}
                </p>
              ) : null}
            </div>
            <Stepper steps={steps} current={clamped} variant="dots" />
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                title={closeLabel}
                aria-label={closeLabel}
                onClick={skip}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4" data-as="wizard-body">
            {current?.title !== undefined ? (
              <h2 className="mb-3 text-lg font-semibold">{current.title}</h2>
            ) : null}
            {open ? renderStep(ctx) : null}
          </div>
          {showFooter ? (
            <div className="flex items-center gap-2 border-t border-[var(--as-border)] px-5 py-3">
              <Button variant="ghost" size="sm" disabled={clamped === 0} onClick={ctx.back}>
                {backLabel}
              </Button>
              <div className="flex-1" />
              {skipLabel !== null ? (
                <Button variant="ghost" size="sm" onClick={skip}>
                  {skipLabel}
                </Button>
              ) : null}
              <Button
                size="sm"
                disabled={!canContinue}
                onClick={ctx.next}
              >
                {clamped === 0 ? getStartedLabel : (current?.nextLabel ?? nextLabel)}
              </Button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
