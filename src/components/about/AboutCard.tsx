import * as React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader } from '../card/Card'

export interface AboutCardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  heading?: 'h2' | 'h3' | 'h4'
}

export const AboutCard = React.forwardRef<HTMLDivElement, AboutCardProps>(
  function AboutCard({ icon, title, description, heading = 'h2', className, children, ...props }, ref) {
    const Title = heading
    return (
      <Card ref={ref} data-as="about-card" className={cn('h-fit', className)} {...props}>
        <CardHeader className="flex-row items-center gap-3">
          {icon ? (
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-secondary)] text-[var(--as-secondary-fg)] [&_svg]:size-5"
            >
              {icon}
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <Title
              data-as="card-title"
              className="font-semibold leading-none tracking-tight"
            >
              {title}
            </Title>
            {description ? (
              <p className="text-sm text-[var(--as-muted-fg)]">{description}</p>
            ) : null}
          </div>
        </CardHeader>
        {children ? <CardContent>{children}</CardContent> : null}
      </Card>
    )
  },
)
