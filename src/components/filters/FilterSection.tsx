import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FilterSectionLabels {
  /** Native tooltip of the header while the section is closed. */
  expand?: string
  /** Native tooltip of the header while the section is open. */
  collapse?: string
  /** Announced beside a zero count. */
  noneMatch?: string
  /** Announced beside the title while the facet is away from its default. */
  active?: string
}

export interface FilterSectionProps
  extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  title: React.ReactNode
  /** The facet is away from its default — the dot marks it. Never forces the section open. */
  active?: boolean
  /** Facet count; `0` renders, `undefined` renders nothing. */
  count?: number
  /** Render the count as `≥N` — the host truncated the bucket. */
  countAtLeast?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Format the count; the second argument is the truncation marker. */
  formatCount?: (count: number, truncated?: boolean) => React.ReactNode
  labels?: FilterSectionLabels
}

/**
 * One collapsible rail section. The header is a real button and
 * `aria-expanded` follows the actual state — an active section may stay
 * collapsed, the dot and the count carry the signal.
 */
export const FilterSection = React.forwardRef<HTMLElement, FilterSectionProps>(
  function FilterSection(
    {
      title,
      active = false,
      count,
      countAtLeast = false,
      defaultOpen = false,
      open,
      onOpenChange,
      formatCount,
      labels,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const expanded = open ?? uncontrolledOpen
    const uid = React.useId()
    const titleId = `${uid}-title`
    const contentId = `${uid}-content`

    const toggle = () => {
      const next = !expanded
      if (open === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    }

    const countNode =
      count === undefined
        ? null
        : (formatCount?.(count, countAtLeast && count > 0) ??
          `${countAtLeast && count > 0 ? '\u2265' : ''}${count.toLocaleString()}`)

    return (
      <section
        ref={ref}
        data-as="filter-section"
        data-active={active || undefined}
        data-open={expanded || undefined}
        className={cn('flex min-w-0 flex-col', className)}
        {...props}
        aria-labelledby={titleId}
      >
        <h3 className="m-0">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={toggle}
            title={expanded ? (labels?.collapse ?? 'Collapse') : (labels?.expand ?? 'Expand')}
            className="flex min-h-[44px] w-full items-center gap-2 rounded-[var(--as-radius-sm)] px-2 text-start text-sm font-medium text-[var(--as-fg)] transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-focus-ring)]"
          >
            {active ? (
              <span
                data-as="filter-section-dot"
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[var(--as-primary)]"
              />
            ) : null}
            <span id={titleId} className="min-w-0 flex-1 truncate">
              {title}
            </span>
            {active ? (
              <span className="sr-only">, {labels?.active ?? 'filtered'}</span>
            ) : null}
            {countNode !== null ? (
              <span
                data-as="filter-section-count"
                className="shrink-0 rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--as-muted-fg)]"
              >
                <bdi dir="ltr">{countNode}</bdi>
                {count === 0 ? (
                  <span className="sr-only">, {labels?.noneMatch ?? 'none match now'}</span>
                ) : null}
              </span>
            ) : null}
            <ChevronRight
              aria-hidden="true"
              className={cn(
                'size-4 shrink-0 text-[var(--as-muted-fg)] transition-transform motion-reduce:transition-none',
                expanded ? 'rotate-90' : 'rtl:rotate-180',
              )}
            />
          </button>
        </h3>
        <div
          id={contentId}
          data-as="filter-section-content"
          hidden={!expanded}
          className="min-w-0 px-2 pb-2 pt-1"
        >
          {children}
        </div>
      </section>
    )
  },
)
