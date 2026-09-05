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
}

export const SettingsShell = React.forwardRef<HTMLDivElement, SettingsShellProps>(
  function SettingsShell(
    { nav, active, onNavigate, header, children, className, navClassName },
    ref,
  ) {
    const HeaderIcon = header?.icon
    return (
      <div
        ref={ref}
        data-as="settings-shell"
        className={cn('grid grid-cols-1 gap-8 lg:grid-cols-4', className)}
      >
        <nav className="lg:col-span-1" aria-label="Settings sections">
          <div
            className={cn(
              'space-y-1 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-3 lg:sticky lg:top-24',
              navClassName,
            )}
          >
            {header ? (
              <div className="mb-2 flex items-center gap-2.5 border-b border-[var(--as-border)] px-3 py-2">
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
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate(id)}
                  className={cn(
                    'flex w-full cursor-pointer items-start rounded-[var(--as-radius)] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                    isActive
                      ? 'bg-[color-mix(in_srgb,var(--as-primary)_12%,transparent)] font-bold text-[var(--as-primary)]'
                      : 'font-medium text-[var(--as-fg)] hover:bg-[var(--as-muted)]',
                  )}
                >
                  {Icon ? (
                    <Icon
                      className="mr-3 mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                  ) : null}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{label}</span>
                    {description ? (
                      <span className="text-[11px] font-normal text-[var(--as-muted-fg)]">
                        {description}
                      </span>
                    ) : null}
                  </span>
                  {trailing ? (
                    <span className="ml-auto flex items-center self-center pl-2">
                      {trailing}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </nav>
        <div className="min-w-0 lg:col-span-3">{children}</div>
      </div>
    )
  },
)
