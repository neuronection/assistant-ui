import * as React from 'react'
import { cn } from '../../lib/utils'
import { InfoButton } from '../info-button/InfoButton'

export interface FieldLabelProps {
  children: React.ReactNode
  info: React.ReactNode
  infoTitle?: React.ReactNode
  label?: string
  showOnHover?: boolean
  className?: string
}

export function FieldLabel({
  children,
  info,
  infoTitle,
  label,
  showOnHover,
  className,
}: FieldLabelProps) {
  return (
    <span data-as="field-label" className={cn('group flex items-center gap-1 text-xs', className)}>
      <span>{children}</span>
      <InfoButton title={infoTitle} label={label} showOnHover={showOnHover}>
        {info}
      </InfoButton>
    </span>
  )
}
