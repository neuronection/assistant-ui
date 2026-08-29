import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/Popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

type IconType = React.ComponentType<{ className?: string }>

export interface InfoTooltipProps {
  content: React.ReactNode
  title?: string
  icon?: IconType
  side?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  label?: string
  className?: string
}

export function InfoTooltip({
  content,
  title,
  icon: Icon = Info,
  side = 'top',
  trigger = 'hover',
  label = 'Information',
  className,
}: InfoTooltipProps) {
  const iconButtonClassName = cn(
    'inline-flex size-6 items-center justify-center rounded-[var(--as-radius-sm)] text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
    className,
  )

  if (trigger === 'click') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label={label} className={iconButtonClassName}>
            <Icon className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side={side} className="w-72">
          {title ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide">{title}</p>
          ) : null}
          <div className="text-sm leading-relaxed text-[var(--as-muted-fg)]">{content}</div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} className={iconButtonClassName}>
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
