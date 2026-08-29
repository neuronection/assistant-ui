import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose = DialogPrimitive.Close

const modalContentVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  closeLabel?: string
}

export const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(function ModalContent({ className, children, size, closeLabel = 'Close', ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-as="modal-overlay"
        className={cn('as-anim-fade fixed inset-0 z-50 bg-[var(--as-overlay)]')}
      />
      <DialogPrimitive.Content
        ref={ref}
        data-as="modal"
        className={cn(
          'as-anim-modal fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-fg)] shadow-[var(--as-shadow-3)] focus:outline-none',
          modalContentVariants({ size }),
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-4 top-4 rounded-[var(--as-radius-sm)] p-1 text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <X aria-hidden="true" className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})

export const ModalHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function ModalHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="modal-header"
        className={cn('flex flex-col gap-1.5 p-6 pb-4', className)}
        {...props}
      />
    )
  },
)

export const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function ModalTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-as="modal-title"
      className={cn('pr-8 text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
})

export const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function ModalDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-as="modal-description"
      className={cn('text-sm text-[var(--as-muted-fg)]', className)}
      {...props}
    />
  )
})

export const ModalFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function ModalFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="modal-footer"
        className={cn(
          'flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end',
          className,
        )}
        {...props}
      />
    )
  },
)

export { modalContentVariants }
