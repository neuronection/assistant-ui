import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface NavChild {
  id: string
  label: string
  icon?: LucideIcon
  badge?: string | number
  /** Divider label rendered above this child (first occurrence only). */
  section?: string
  disabled?: boolean
}

export interface NavItem {
  id: string
  label: string
  icon?: LucideIcon
  badge?: string | number
  /** One nesting level; deeper trees stay app-side. */
  children?: NavChild[]
  disabled?: boolean
  /** Divider label rendered above this item (first occurrence only) —
   * for flat sidebars with visual groups. Ignored in the collapsed rail. */
  section?: string
}

export interface SidebarNavLabels {
  /** aria-label on the <nav> element. */
  navAria?: string
  /** Collapsed-rail toggle title when collapsed. */
  expand?: string
  /** Collapsed-rail toggle title when expanded. */
  collapse?: string
  /** aria-label for a collapsed group's flyout trigger. */
  openGroup?: string
}

export interface SidebarNavProps {
  /** Pre-filtered by the app (roles, feature flags); order = render order. */
  items: NavItem[]
  /** The app resolves route → id; matching logic stays app-side. */
  activeId?: string | null
  /** Fires for leaves only; group triggers toggle expansion instead. */
  onNavigate?: (id: string) => void
  /** Controlled icon rail. */
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Renders the rail collapse/expand toggle handle (desktop only). */
  collapsible?: boolean
  /** Controlled group expansion; uncontrolled defaults to internal
   * state + auto-expand when activeId enters a group. */
  expandedIds?: string[]
  onExpandedIdsChange?: (ids: string[]) => void
  /** Slot above the list (brand, logo). */
  header?: React.ReactNode
  /** Slot below the list (settings, profile, version). */
  footer?: React.ReactNode
  labels?: SidebarNavLabels
  className?: string
  /** Targets the scrollable list region. */
  navClassName?: string
}

const FLYOUT_DELAY_MS = 150

const itemButtonClass = (active: boolean) =>
  cn(
    'flex w-full cursor-pointer items-center gap-3 rounded-[var(--as-radius)] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
    active
      ? 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] font-bold text-[var(--as-primary)]'
      : 'font-medium text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
  )

const flyoutContentClass =
  'as-anim-pop z-[var(--as-z-popover)] min-w-44 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-1 text-[var(--as-fg)] shadow-[var(--as-shadow-3)] focus:outline-none'

function Badge({ value, active }: { value: string | number; active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
        active
          ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)]'
          : 'bg-[var(--as-muted)] text-[var(--as-muted-fg)]',
      )}
    >
      {value}
    </span>
  )
}

function ItemBadge({ badge, active }: { badge?: string | number; active: boolean }) {
  if (badge === undefined) return null
  return (
    <span className="ml-auto">
      <Badge value={badge} active={active} />
    </span>
  )
}

export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav(
    {
      items,
      activeId,
      onNavigate,
      collapsed = false,
      onCollapsedChange,
      collapsible = false,
      expandedIds,
      onExpandedIdsChange,
      header,
      footer,
      labels,
      className,
      navClassName,
    },
    ref,
  ) {
    const baseId = React.useId()
    const listRef = React.useRef<HTMLDivElement>(null)
    const flyoutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const [openFlyout, setOpenFlyout] = React.useState<string | null>(null)
    const [internalExpanded, setInternalExpanded] = React.useState<string[]>([])

    const controlledExpanded =
      expandedIds !== undefined && onExpandedIdsChange !== undefined
    const expanded = controlledExpanded ? (expandedIds as string[]) : internalExpanded

    const setExpandedList = React.useCallback(
      (next: string[]) => {
        if (controlledExpanded) onExpandedIdsChange?.(next)
        else setInternalExpanded(next)
      },
      [controlledExpanded, onExpandedIdsChange],
    )

    const toggleGroup = React.useCallback(
      (id: string) => {
        setExpandedList(
          expanded.includes(id)
            ? expanded.filter((g) => g !== id)
            : [...expanded, id],
        )
      },
      [expanded, setExpandedList],
    )

    // Auto-expand the group containing the active item so the highlighted
    // entry is always visible (uncontrolled mode only — the app owns
    // expansion when controlled).
    React.useEffect(() => {
      if (controlledExpanded || activeId == null) return
      const owner = items.find((it) => it.children?.some((c) => c.id === activeId))
      if (owner && !expanded.includes(owner.id)) {
        setExpandedList([...expanded, owner.id])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId, items, controlledExpanded])

    React.useEffect(() => {
      return () => {
        if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
      }
    }, [])

    const flyoutEnter = (id: string) => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
      flyoutTimer.current = setTimeout(() => setOpenFlyout(id), FLYOUT_DELAY_MS)
    }
    const flyoutLeave = () => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
      flyoutTimer.current = setTimeout(() => setOpenFlyout(null), FLYOUT_DELAY_MS)
    }
    const flyoutEnterCancel = () => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current)
    }

    const navigate = (id: string) => {
      setOpenFlyout(null)
      onNavigate?.(id)
    }

    // ---- keyboard navigation over the visible list ----
    const visibleItems = (): HTMLButtonElement[] => {
      const list = listRef.current
      if (!list) return []
      return Array.from(
        list.querySelectorAll<HTMLButtonElement>('[data-as-nav-item]'),
      ).filter((el) => el.closest('[hidden]') === null)
    }

    const focusSibling = (current: HTMLElement, offset: number) => {
      const all = visibleItems()
      const index = all.indexOf(current as HTMLButtonElement)
      if (index === -1) return
      const next = all[Math.min(Math.max(index + offset, 0), all.length - 1)]
      next?.focus()
    }

    const handleFlyoutArrowKeys = (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const buttons = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
          'button[data-as-flyout-item]:not([disabled])',
        ),
      )
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
      const step = e.key === 'ArrowDown' ? 1 : buttons.length - 1
      buttons[(index + step) % buttons.length]?.focus()
    }

    const groupTriggerFor = (id: string) =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[data-as-nav-group-id]',
        ) ?? [],
      ).find((b) => b.dataset.asNavGroupId === id)

    const firstChildFor = (id: string) =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[data-as-nav-parent-id]',
        ) ?? [],
      ).find((b) => b.dataset.asNavParentId === id && !b.disabled)

    const handleListKeyDown = (e: React.KeyboardEvent) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-as-nav-item]',
      )
      if (!button) return
      const groupId = button.dataset.asNavGroupId
      const parentId = button.dataset.asNavParentId
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          focusSibling(button, 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          focusSibling(button, -1)
          break
        case 'Home': {
          e.preventDefault()
          visibleItems()[0]?.focus()
          break
        }
        case 'End': {
          e.preventDefault()
          const all = visibleItems()
          all[all.length - 1]?.focus()
          break
        }
        case 'ArrowRight':
          if (groupId) {
            e.preventDefault()
            if (!expanded.includes(groupId)) {
              setExpandedList([...expanded, groupId])
            } else {
              firstChildFor(groupId)?.focus()
            }
          }
          break
        case 'ArrowLeft':
          if (parentId) {
            e.preventDefault()
            groupTriggerFor(parentId)?.focus()
          } else if (groupId && expanded.includes(groupId)) {
            e.preventDefault()
            toggleGroup(groupId)
          }
          break
      }
    }

    const navAria = labels?.navAria ?? 'Main navigation'
    const rail = collapsed

    const flyoutHeader = (text: string) => (
      <div className="border-b border-[var(--as-border)] px-2 py-1.5 text-xs font-bold text-[var(--as-muted-fg)]">
        {text}
      </div>
    )

    return (
      <nav
        ref={ref}
        data-as="sidebar-nav"
        aria-label={navAria}
        className={cn(
          'relative flex h-full flex-col border-r border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] transition-[width] duration-200',
          rail ? 'w-20' : 'w-64',
          className,
        )}
      >
        {collapsible ? (
          <div className="pointer-events-none absolute inset-y-0 -right-3 z-10 hidden flex-col justify-center lg:flex">
            <button
              type="button"
              onClick={() => onCollapsedChange?.(!collapsed)}
              title={
                collapsed
                  ? (labels?.expand ?? 'Expand sidebar')
                  : (labels?.collapse ?? 'Collapse sidebar')
              }
              aria-label={
                collapsed
                  ? (labels?.expand ?? 'Expand sidebar')
                  : (labels?.collapse ?? 'Collapse sidebar')
              }
              className="pointer-events-auto flex size-6 items-center justify-center rounded-lg border border-[var(--as-border)] bg-[var(--as-surface-raised)] text-[var(--as-muted-fg)] shadow-[var(--as-shadow-2)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {collapsed ? (
                <ChevronRight className="size-3.5" aria-hidden />
              ) : (
                <ChevronLeft className="size-3.5" aria-hidden />
              )}
            </button>
          </div>
        ) : null}

        {header ? <div className="shrink-0">{header}</div> : null}

        <div
          ref={listRef}
          onKeyDown={handleListKeyDown}
          className={cn('min-h-0 flex-1 overflow-y-auto px-3 py-3', navClassName)}
        >
          <ul className="space-y-1">
            {items.map((item, index) => {
              // Group whose children were all filtered out app-side renders
              // nothing (presentational).
              if (item.children !== undefined && item.children.length === 0) {
                return null
              }
              const sectionSeen =
                !rail &&
                item.section !== undefined &&
                items.findIndex((i) => i.section === item.section) === index
              const sectionDivider = sectionSeen ? (
                <div
                  role="presentation"
                  className="mt-2 border-t border-[var(--as-border)] px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--as-muted-fg)]"
                >
                  {item.section}
                </div>
              ) : null
              const active = item.id === activeId
              const childActive = item.children?.some((c) => c.id === activeId) ?? false
              const isExpanded = expanded.includes(item.id)
              const Icon = item.icon
              const groupId = `${baseId}-group-${item.id}`

              if (item.children && item.children.length > 0 && rail) {
                return (
                  <li key={item.id}>
                    {sectionDivider}
                    <PopoverPrimitive.Root
                      open={openFlyout === item.id}
                      onOpenChange={(open) => {
                        if (!open) setOpenFlyout(null)
                      }}
                    >
                      <PopoverPrimitive.Anchor asChild>
                        <button
                          type="button"
                          data-as-nav-item
                          data-as-nav-group-id={item.id}
                          disabled={item.disabled}
                          aria-label={labels?.openGroup ?? `Open ${item.label} menu`}
                          aria-haspopup="true"
                          aria-expanded={openFlyout === item.id}
                          onClick={() => setOpenFlyout(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setOpenFlyout(item.id)
                            }
                          }}
                          onMouseEnter={() => flyoutEnter(item.id)}
                          onMouseLeave={flyoutLeave}
                          className={cn(itemButtonClass(active || childActive), 'justify-center px-0')}
                        >
                          {Icon ? (
                            <Icon
                              className={cn(
                                'size-5 shrink-0',
                                active || childActive
                                  ? 'text-[var(--as-primary)]'
                                  : 'text-[var(--as-muted-fg)]',
                              )}
                              aria-hidden
                            />
                          ) : null}
                        </button>
                      </PopoverPrimitive.Anchor>
                      <PopoverPrimitive.Portal>
                        <PopoverPrimitive.Content
                          side="right"
                          sideOffset={8}
                          aria-label={item.label}
                          onCloseAutoFocus={(e) => {
                            // Menu-standard: focus returns to the trigger.
                            e.preventDefault()
                            groupTriggerFor(item.id)?.focus()
                          }}
                          onMouseEnter={flyoutEnterCancel}
                          onMouseLeave={flyoutLeave}
                          onKeyDown={handleFlyoutArrowKeys}
                          className={flyoutContentClass}
                        >
                          {flyoutHeader(item.label)}
                          <ul className="mt-1 space-y-0.5">
                            {item.children.map((child) => (
                              <li key={child.id}>
                                <button
                                  type="button"
                                  data-as-flyout-item
                                  disabled={child.disabled}
                                  onClick={() => navigate(child.id)}
                                  aria-current={child.id === activeId ? 'page' : undefined}
                                  className={cn(
                                    'flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-left text-sm outline-none transition-colors focus:bg-[var(--as-secondary)] disabled:pointer-events-none disabled:opacity-50',
                                    child.id === activeId && 'font-bold text-[var(--as-primary)]',
                                  )}
                                >
                                  {child.icon ? <child.icon aria-hidden /> : null}
                                  <span className="min-w-0 flex-1 truncate">{child.label}</span>
                                  <ItemBadge badge={child.badge} active={child.id === activeId} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </PopoverPrimitive.Content>
                      </PopoverPrimitive.Portal>
                    </PopoverPrimitive.Root>
                  </li>
                )
              }

              if (item.children && item.children.length > 0) {
                return (
                  <li key={item.id}>
                    {sectionDivider}
                    <button
                      type="button"
                      data-as-nav-item
                      data-as-nav-group-id={item.id}
                      disabled={item.disabled}
                      aria-expanded={isExpanded}
                      aria-controls={groupId}
                      onClick={() => toggleGroup(item.id)}
                      className={itemButtonClass(active || childActive)}
                    >
                      {Icon ? (
                        <Icon
                          className={cn(
                            'size-4 shrink-0',
                            active || childActive
                              ? 'text-[var(--as-primary)]'
                              : 'text-[var(--as-muted-fg)]',
                          )}
                          aria-hidden
                        />
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <ItemBadge badge={item.badge} active={active || childActive} />
                      {isExpanded ? (
                        <ChevronDown className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
                      )}
                    </button>
                    <ul id={groupId} hidden={!isExpanded} className="mt-1 space-y-0.5 pl-6">
                      {item.children.map((child) => {
                        const childActiveItem = child.id === activeId
                        const ChildIcon = child.icon
                        const sectionSeen =
                          child.section !== undefined &&
                          item.children!.findIndex(
                            (c) => c.section === child.section,
                          ) === item.children!.indexOf(child)
                        return (
                          <li key={child.id}>
                            {sectionSeen ? (
                              <div
                                role="presentation"
                                className="mt-2 border-t border-[var(--as-border)] px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--as-muted-fg)]"
                              >
                                {child.section}
                              </div>
                            ) : null}
                            <button
                              type="button"
                              data-as-nav-item
                              data-as-nav-parent-id={item.id}
                              disabled={child.disabled}
                              aria-current={childActiveItem ? 'page' : undefined}
                              onClick={() => navigate(child.id)}
                              className={cn(
                                itemButtonClass(childActiveItem),
                                'py-2 pl-3 pr-2',
                              )}
                            >
                              {ChildIcon ? (
                                <ChildIcon className="size-4 shrink-0" aria-hidden />
                              ) : null}
                              <span className="min-w-0 flex-1 truncate">{child.label}</span>
                              <ItemBadge badge={child.badge} active={childActiveItem} />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              }

              return (
                <li key={item.id}>
                  {sectionDivider}
                  <button
                    type="button"
                    data-as-nav-item
                    disabled={item.disabled}
                    title={rail ? item.label : undefined}
                    aria-label={rail ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => navigate(item.id)}
                    className={cn(itemButtonClass(active), rail && 'justify-center px-0')}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          'shrink-0',
                          rail ? 'size-5' : 'size-4',
                          active ? 'text-[var(--as-primary)]' : 'text-[var(--as-muted-fg)]',
                        )}
                        aria-hidden
                      />
                    ) : null}
                    {!rail ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                    {!rail ? <ItemBadge badge={item.badge} active={active} /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-[var(--as-border)] p-3">{footer}</div>
        ) : null}
      </nav>
    )
  },
)
