import * as React from 'react'
import { AlertTriangle, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '../modal/Modal'

export interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeLabel?: string
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  icon: Icon = AlertTriangle,
  size = 'sm',
  closeLabel = 'Close',
}: ConfirmationModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size={size} closeLabel={closeLabel} aria-describedby={undefined}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'rounded-[var(--as-radius)] p-2',
                destructive
                  ? 'bg-[var(--as-danger)]/10 text-[var(--as-danger)]'
                  : 'bg-[var(--as-secondary)] text-[var(--as-fg)]',
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <ModalTitle>{title}</ModalTitle>
          </div>
          {description ? <ModalDescription>{description}</ModalDescription> : null}
        </ModalHeader>
        <div className="flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => onConfirm()}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
