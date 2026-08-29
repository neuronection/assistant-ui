import * as React from 'react'
import { ChevronRight, House } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbLinkProps {
  href: string
  className?: string
  title?: string
  'aria-label'?: string
  children: React.ReactNode
}

export interface BreadcrumbsProps extends React.ComponentProps<'nav'> {
  items?: BreadcrumbItem[]
  currentLabel?: string
  homeHref?: string
  homeLabel?: string
  linkComponent?: React.ComponentType<BreadcrumbLinkProps>
}

const linkClass =
  'text-[10px] font-bold uppercase tracking-wider text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-primary)]'

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      items = [],
      currentLabel,
      homeHref,
      homeLabel = 'Home',
      linkComponent: LinkComponent = 'a',
      className,
      ...props
    },
    ref,
  ) {
    if (items.length === 0 && !currentLabel && !homeHref) return null

    return (
      <nav
        ref={ref}
        data-as="breadcrumbs"
        aria-label="Breadcrumb"
        className={cn(
          'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight',
          className,
        )}
        {...props}
      >
        {homeHref ? (
          <>
            <LinkComponent href={homeHref} className="shrink-0 p-0.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-primary)]" aria-label={homeLabel} title={homeLabel}>
              <House className="size-3" aria-hidden />
            </LinkComponent>
            {items.length > 0 || currentLabel ? (
              <ChevronRight className="size-2.5 shrink-0 text-[var(--as-muted-fg)] opacity-60" aria-hidden />
            ) : null}
          </>
        ) : null}
        {items.map((item, index) => {
          const isLast = index === items.length - 1 && !currentLabel
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 || homeHref ? (
                <ChevronRight className="size-2.5 shrink-0 text-[var(--as-muted-fg)] opacity-60" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <LinkComponent href={item.href} className={linkClass}>
                  {item.icon}
                  {item.label}
                </LinkComponent>
              ) : (
                <span className={linkClass}>
                  {item.icon}
                  {item.label}
                </span>
              )}
            </React.Fragment>
          )
        })}
        {currentLabel ? (
          <>
            {items.length > 0 || homeHref ? (
              <ChevronRight className="size-2.5 shrink-0 text-[var(--as-muted-fg)] opacity-60" aria-hidden />
            ) : null}
            <span
              aria-current="page"
              className="text-[10px] font-black uppercase tracking-wider text-[var(--as-fg)]"
            >
              {currentLabel}
            </span>
          </>
        ) : null}
      </nav>
    )
  },
)
