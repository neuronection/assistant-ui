import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const noteStyles = cva(
  'rounded-[var(--as-radius-lg)] border p-5 text-sm leading-relaxed',
  {
    variants: {
      tone: {
        info: 'border-[color-mix(in_srgb,var(--as-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--as-primary)_8%,transparent)] text-[var(--as-fg)]',
        warning:
          'border-[color-mix(in_srgb,var(--as-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--as-warning)_12%,transparent)] text-[color-mix(in_srgb,var(--as-warning)_72%,var(--as-fg))]',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
)

export interface AboutNoteProps
  extends Omit<React.ComponentProps<'div'>, 'title'>,
    VariantProps<typeof noteStyles> {
  title?: React.ReactNode
}

export const AboutNote = React.forwardRef<HTMLDivElement, AboutNoteProps>(
  function AboutNote({ tone, title, className, children, ...props }, ref) {
    return (
      <div ref={ref} data-as="about-note" data-as-tone={tone} className={cn(noteStyles({ tone }), className)} {...props}>
        {title ? <p className="mb-1.5 font-semibold uppercase tracking-wider">{title}</p> : null}
        {children}
      </div>
    )
  },
)
