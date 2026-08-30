import * as React from 'react'
import { cn } from '../../lib/utils'

export interface AboutFooterLineProps extends React.ComponentProps<'p'> {
  version?: string
  copyright?: React.ReactNode
}

export const AboutFooterLine = React.forwardRef<
  HTMLParagraphElement,
  AboutFooterLineProps
>(function AboutFooterLine({ version, copyright, className, children, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-as="about-footer-line"
      className={cn('text-center text-xs text-[var(--as-muted-fg)]', className)}
      {...props}
    >
      {version ? <span>{version}</span> : null}
      {version && (copyright || children) ? <br /> : null}
      {copyright ?? children}
    </p>
  )
})
