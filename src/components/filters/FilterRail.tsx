import * as React from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button'
import { PanelModal } from '../modal'

export type FilterRailLayout = 'rail' | 'compact'

export interface FilterRailLabels {
  /** The noun on the compact trigger and the rail count. */
  filters?: string
  /** Accessible name of the compact sheet's close button. */
  close?: string
  /** Default footer action when the host passes no `footer`. */
  done?: string
  clearAll?: string
}

export interface FilterRailProps {
  /** `rail` is the vertical `<aside>`; `compact` is the toolbar + sheet. Required. */
  layout: FilterRailLayout
  title: React.ReactNode
  labels?: FilterRailLabels
  /** Facets away from their default. `undefined` omits the badge — never renders 0. */
  activeCount?: number
  /** Format the rail's active count; the compact trigger keeps the plain number. */
  formatCount?: (count: number) => React.ReactNode
  onClear?: () => void
  /** Host search control; rendered under the rail header and in the compact toolbar. */
  search?: React.ReactNode
  /**
   * Replaces the compact sheet footer (and the rail footer slot). A function
   * receives `close`, which closes the compact sheet — a no-op in the rail.
   */
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode)
  children?: React.ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * The vertical half of the filter module: a rail of `FilterSection`s, or the
 * same content behind a compact toolbar and assistant-ui's `PanelModal`.
 * Layout only — the host owns sticky/scroll CSS, values and counts.
 */
export const FilterRail = React.forwardRef<HTMLElement, FilterRailProps>(function FilterRail(
  {
    layout,
    title,
    labels,
    activeCount,
    formatCount,
    onClear,
    search,
    footer,
    children,
    className,
    'data-testid': testId,
  },
  ref,
) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const uid = React.useId()
  const titleId = `${uid}-title`

  const filtersLabel = labels?.filters ?? 'Filters'
  const clearAllLabel = labels?.clearAll ?? 'Clear all'
  const doneLabel = labels?.done ?? 'Done'
  const countText = activeCount === undefined ? null : activeCount.toLocaleString()
  const countNode =
    activeCount === undefined ? null : (formatCount?.(activeCount) ?? activeCount.toLocaleString())
  const showClear = Boolean(onClear) && (activeCount === undefined || activeCount > 0)

  const closeSheet = () => setOpen(false)
  const closeRail = () => {}
  const renderFooter = (
    node: React.ReactNode | ((close: () => void) => React.ReactNode),
    close: () => void,
  ) => (typeof node === 'function' ? node(close) : node)

  const body = (
    <div data-as="filter-rail-body" className="flex min-w-0 flex-col gap-2">
      {children}
    </div>
  )

  if (layout === 'compact') {
    const defaultFooter = (
      <div className={cn('flex items-center gap-2', showClear ? 'justify-between' : 'justify-end')}>
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="min-h-[44px] text-[var(--as-muted-fg)]"
          >
            <X className="size-4" aria-hidden="true" />
            {clearAllLabel}
          </Button>
        ) : null}
        <Button type="button" onClick={() => setOpen(false)} className="min-h-[44px]">
          {doneLabel}
        </Button>
      </div>
    )

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-as="filter-rail"
        data-layout="compact"
        data-testid={testId}
        className={cn('flex w-full flex-wrap items-center gap-2', className)}
      >
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-4 text-sm font-medium text-[var(--as-fg)] transition-colors hover:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <SlidersHorizontal className="size-4 text-[var(--as-muted-fg)]" aria-hidden="true" />
          <span aria-live="polite">
            {countText === null ? filtersLabel : `${filtersLabel} (${countText})`}
          </span>
        </button>
        <PanelModal
          open={open}
          onOpenChange={setOpen}
          size="sm"
          title={title}
          closeLabel={labels?.close ?? 'Close'}
          bodyClassName="flex min-h-0 flex-1 flex-col gap-3 p-5 sm:p-6"
          footer={footer ? renderFooter(footer, closeSheet) : defaultFooter}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
        >
          {body}
        </PanelModal>
      </div>
    )
  }

  return (
    <aside
      ref={ref}
      data-as="filter-rail"
      data-layout="rail"
      data-testid={testId}
      aria-labelledby={titleId}
      className={cn('flex w-full flex-col gap-3', className)}
    >
      <div data-as="filter-rail-header" className="flex items-center gap-2">
        <h2
          id={titleId}
          className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--as-fg)]"
        >
          {title}
        </h2>
        {countNode !== null ? (
          <span
            data-as="filter-rail-count"
            aria-live="polite"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--as-muted-fg)]"
          >
            <span className="sr-only">{filtersLabel}: </span>
            <bdi dir="ltr">{countNode}</bdi>
          </span>
        ) : null}
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-sm font-medium text-[var(--as-muted-fg)] transition-colors hover:bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] hover:text-[var(--as-danger)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <X className="size-4" aria-hidden="true" />
            <span>{clearAllLabel}</span>
          </button>
        ) : null}
      </div>
      {search ? <div data-as="filter-rail-search">{search}</div> : null}
      {body}
      {footer ? <div data-as="filter-rail-footer">{renderFooter(footer, closeRail)}</div> : null}
    </aside>
  )
})
