import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SettingsNavItem {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  /** Optional trailing node (status dot, count, badge) at the row edge. */
  trailing?: React.ReactNode
}

export interface SettingsShellProps {
  nav: SettingsNavItem[]
  active: string
  onNavigate: (id: string) => void
  header?: { icon?: LucideIcon; title: string }
  children: React.ReactNode
  className?: string
  navClassName?: string
  /** Test hook: data-testid for the `<nav>` element. */
  navTestId?: string
}

/**
 * Two-pane settings shell whose responsive columns key off the shell's OWN
 * width (container query) instead of the viewport: beside a docked side
 * panel the page column can be narrow on a wide screen, so viewport media
 * queries laid a 4-column grid into ~350px and truncated the rail. Below
 * 48rem of shell width the rail collapses to a wrapping chip row; at or
 * above it, the classic 1+3 rail grid renders. Layout lives in component
 * CSS ([data-as] hooks in tokens.css) because apps load their compiled
 * utilities after this stylesheet — any property the CSS mode rules own
 * must not also appear as a utility class on the same element.
 */
export const SettingsShell = React.forwardRef<HTMLDivElement, SettingsShellProps>(
  function SettingsShell(
    { nav, active, onNavigate, header, children, className, navClassName, navTestId },
    ref,
  ) {
    const HeaderIcon = header?.icon
    return (
      <div
        ref={ref}
        data-as="settings-shell"
        className={className}
      >
        <div data-as="settings-shell-body">
          <nav
            data-as="settings-shell-nav"
            aria-label="Settings sections"
            data-testid={navTestId}
          >
            <div
              data-as="settings-shell-navbox"
              className={cn('lg:sticky lg:top-24', navClassName)}
            >
              {header ? (
                <div data-as="settings-shell-navheader">
                  {HeaderIcon ? (
                    <HeaderIcon
                      className="size-5 shrink-0 text-[var(--as-primary)]"
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate text-sm font-bold text-[var(--as-fg)]">
                    {header.title}
                  </span>
                </div>
              ) : null}
              {nav.map(({ id, label, description, icon: Icon, trailing }) => {
                const isActive = id === active
                return (
                  <button
                    key={id}
                    type="button"
                    data-as="settings-shell-navitem"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onNavigate(id)}
                    className={cn(
                      'cursor-pointer px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                      isActive
                        ? 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] font-bold text-[var(--as-primary)]'
                        : 'font-medium text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
                    )}
                  >
                    {Icon ? (
                      <Icon
                        data-as="settings-shell-navicon"
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                    ) : null}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{label}</span>
                      {description ? (
                        <span
                          data-as="settings-shell-navdesc"
                          className="text-[11px] font-normal text-[var(--as-muted-fg)]"
                        >
                          {description}
                        </span>
                      ) : null}
                    </span>
                    {trailing ? (
                      <span data-as="settings-shell-navtrailing" className="flex items-center self-center">
                        {trailing}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </nav>
          <div data-as="settings-shell-content">{children}</div>
        </div>
      </div>
    )
  },
)
