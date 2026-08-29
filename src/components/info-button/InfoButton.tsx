import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import { PopoverButton } from '../popover-button/PopoverButton'

export interface InfoButtonProps {
  children: React.ReactNode
  title?: React.ReactNode
  label?: string
  showOnHover?: boolean
  openOnHover?: boolean
  className?: string
}

export function InfoButton({
  children,
  title,
  label = 'Information',
  showOnHover = true,
  openOnHover = true,
  className,
}: InfoButtonProps) {
  return (
    <span
      data-as="info-button"
      className={cn(
        'shrink-0',
        showOnHover &&
          'opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100',
        className,
      )}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <PopoverButton
        trigger={<Info className="size-4" aria-hidden />}
        label={label}
        triggerClassName="size-6 text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]"
        openOnHover={openOnHover}
        panelClassName="max-w-xs"
      >
        <div className="space-y-1.5">
          {title ? <p className="text-sm font-medium">{title}</p> : null}
          <div className="text-xs text-[var(--as-muted-fg)]">{children}</div>
        </div>
      </PopoverButton>
    </span>
  )
}
