import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../modal/Modal'

export interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  children: React.ReactNode
  onSubmit?: () => void
  submitting?: boolean
  submitDisabled?: boolean
  submitLabel?: string
  cancelLabel?: string
  closeLabel?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contentClassName?: string
  footer?: React.ReactNode
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  onSubmit,
  submitting = false,
  submitDisabled = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  closeLabel = 'Close',
  size = 'md',
  contentClassName,
  footer,
}: FormModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size={size} closeLabel={closeLabel} aria-describedby={undefined}>
        <form
          data-as="form-modal"
          className={cn('contents', contentClassName)}
          onSubmit={(event) => {
            event.preventDefault()
            if (!submitting && !submitDisabled) {
              onSubmit?.()
            }
          }}
        >
          <ModalHeader>
            <div className="flex items-center gap-3">
              {Icon ? (
                <span className="rounded-[var(--as-radius)] bg-[var(--as-secondary)] p-2 text-[var(--as-fg)]">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
              ) : null}
              <ModalTitle>{title}</ModalTitle>
            </div>
            {description ? <ModalDescription>{description}</ModalDescription> : null}
          </ModalHeader>
          <div className="px-6 pb-2">{children}</div>
          {footer ?? (
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                {cancelLabel}
              </Button>
              {onSubmit ? (
                <Button type="submit" disabled={submitDisabled || submitting} loading={submitting}>
                  {submitLabel}
                </Button>
              ) : null}
            </ModalFooter>
          )}
        </form>
      </ModalContent>
    </Modal>
  )
}
