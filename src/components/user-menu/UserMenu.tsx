import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '../menu/Menu'
import { cn } from '../../lib/utils'

export interface UserMenuItem {
  id: string
  label: string
  icon?: LucideIcon
  tone?: 'default' | 'danger'
  disabled?: boolean
  pending?: boolean
  /** Renders as a checkable item (aria-checked) — e.g. theme/language toggles. */
  checked?: boolean
}

export interface UserMenuProps {
  name?: string
  email?: string
  avatarUrl?: string
  /** Fallback disc text when no avatarUrl; derived from `name` when omitted. */
  initials?: string
  items: UserMenuItem[]
  onItemSelect: (id: string) => void
  align?: 'start' | 'end'
  labels?: { openMenu?: string }
  className?: string
}

function deriveInitials(name?: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}

function UserGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  )
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  function UserMenu(
    {
      name,
      email,
      avatarUrl,
      initials,
      items,
      onItemSelect,
      align = 'end',
      labels,
      className,
    },
    ref,
  ) {
    const disc = initials ?? deriveInitials(name)
    const hasIdentity = name !== undefined || email !== undefined

    return (
      <div ref={ref} data-as="user-menu" className={cn('inline-flex', className)}>
        <Menu>
          <MenuTrigger
            type="button"
            aria-label={labels?.openMenu ?? 'Open user menu'}
            aria-haspopup="menu"
            className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 pr-3 transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--as-primary)] text-xs font-bold text-[var(--as-primary-fg)]"
              >
                {disc || <UserGlyph />}
              </span>
            )}
            {name || email ? (
              <span className="flex min-w-0 flex-col text-left leading-tight">
                {name ? (
                  <span className="max-w-40 truncate text-sm font-medium text-[var(--as-fg)]">
                    {name}
                  </span>
                ) : null}
                {email ? (
                  <span className="max-w-40 truncate text-xs text-[var(--as-muted-fg)]">
                    {email}
                  </span>
                ) : null}
              </span>
            ) : null}
          </MenuTrigger>
          <MenuContent align={align} sideOffset={8} className="min-w-48">
            {hasIdentity ? (
              <>
                <div className="flex flex-col px-2 py-1.5">
                  {name ? (
                    <span className="truncate text-sm font-bold text-[var(--as-fg)]">
                      {name}
                    </span>
                  ) : null}
                  {email ? (
                    <span className="truncate text-xs text-[var(--as-muted-fg)]">
                      {email}
                    </span>
                  ) : null}
                </div>
                <MenuSeparator />
              </>
            ) : null}
            {items.map((item) =>
              item.checked !== undefined ? (
                <MenuCheckboxItem
                  key={item.id}
                  icon={item.icon}
                  danger={item.tone === 'danger'}
                  disabled={item.disabled}
                  pending={item.pending}
                  checked={item.checked}
                  onSelect={() => onItemSelect(item.id)}
                >
                  {item.label}
                </MenuCheckboxItem>
              ) : (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  danger={item.tone === 'danger'}
                  disabled={item.disabled}
                  pending={item.pending}
                  onSelect={() => onItemSelect(item.id)}
                >
                  {item.label}
                </MenuItem>
              ),
            )}
          </MenuContent>
        </Menu>
      </div>
    )
  },
)
