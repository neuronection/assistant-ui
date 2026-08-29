import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const panelModalVariants = cva('', {
  variants: {
    size: {
      sm: 'sm:max-w-md',
      md: 'sm:max-w-2xl',
      lg: 'sm:max-w-4xl',
      xl: 'sm:max-w-6xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface PanelModalProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    'title'
  >,
    VariantProps<typeof panelModalVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  headerIcon?: React.ReactNode
  headerActions?: React.ReactNode
  footer?: React.ReactNode
  hideHeader?: boolean
  bodyClassName?: string
  closeLabel?: string
}

/**
 * Dialog panel with a header (icon, title, actions, close), scrollable body
 * and optional sticky footer — full-screen on mobile, centered card on
 * desktop. For plain dialogs prefer the `Modal` parts; for forms prefer
 * `FormModal`.
 */
export const PanelModal = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  PanelModalProps
>(function PanelModal(
  {
    open,
    onOpenChange,
    title,
    headerIcon,
    headerActions,
    footer,
    hideHeader = false,
    bodyClassName,
    closeLabel = 'Close',
    size,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-as="modal-overlay"
          className="as-anim-fade fixed inset-0 z-50 bg-[var(--as-overlay)]"
        />
        <DialogPrimitive.Content
          ref={ref}
          data-as="panel-modal"
          aria-describedby={undefined}
          className={cn(
            'as-anim-pop fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)] focus:outline-none',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--as-radius-lg)] sm:border sm:border-[var(--as-border)]',
            panelModalVariants({ size }),
            className,
          )}
          {...props}
        >
          {hideHeader ? (
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="absolute right-3 top-3 z-10 rounded-[var(--as-radius-sm)] bg-[var(--as-surface-raised)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              <X aria-hidden="true" className="size-4" />
            </DialogPrimitive.Close>
          ) : (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--as-border)] px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                {headerIcon}
                {title ? (
                  <DialogPrimitive.Title className="truncate font-semibold text-[var(--as-fg)]">
                    {title}
                  </DialogPrimitive.Title>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {headerActions}
                <DialogPrimitive.Close
                  aria-label={closeLabel}
                  className="rounded-[var(--as-radius-sm)] p-1.5 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
                >
                  <X aria-hidden="true" className="size-5" />
                </DialogPrimitive.Close>
              </div>
            </div>
          )}
          <div className={cn('min-h-0 flex-1', hideHeader && 'pt-10', bodyClassName ?? 'p-5 sm:p-6')}>
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 border-t border-[var(--as-border)] px-5 py-4 sm:px-6">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})
