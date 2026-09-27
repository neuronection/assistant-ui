import * as React from 'react'
import { Globe, LogOut, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from '../menu/Menu'
import { cn } from '../../lib/utils'

/** Theme preference for the built-in appearance section. */
export type UserMenuTheme = 'light' | 'dark' | 'system'

/** Tone of the status pill. */
export type UserMenuStatusTone = 'success' | 'info' | 'warning'

export interface UserMenuUser {
  name?: string
  email?: string
  /** Raw role (e.g. `'ADMIN'`) — badge text comes from `roleBadge`. */
  role?: string
  avatarUrl?: string
}

export interface UserMenuLanguage {
  id: string
  label: string
}

export interface UserMenuStatus {
  label: string
  tone?: UserMenuStatusTone
}

export interface UserMenuItem {
  id: string
  label: string
  icon?: LucideIcon
  tone?: 'default' | 'danger'
  disabled?: boolean
  pending?: boolean
  /** Renders as a checkable item (aria-checked) — e.g. toggles. */
  checked?: boolean
}

export interface UserMenuIcons {
  logout?: LucideIcon
  language?: LucideIcon
  themeLight?: LucideIcon
  themeDark?: LucideIcon
  themeSystem?: LucideIcon
}

export interface UserMenuProps {
  /** Structured identity — rendered in the trigger and the panel header. */
  user?: UserMenuUser
  /** Legacy flat identity fields (still supported; `user` wins per field). */
  name?: string
  email?: string
  avatarUrl?: string
  /** Fallback disc text when no avatarUrl; derived from `name` when omitted. */
  initials?: string
  /** Badge text for the role (app-translated); falls back to `user.role`. */
  roleBadge?: string
  /**
   * App-composed switcher (ProfileSwitcher / TenantSwitcher). Rendered in
   * its own top section, above the identity block.
   */
  switcher?: React.ReactNode
  /** Status pill rendered under the identity block (e.g. "Synced"). */
  status?: UserMenuStatus
  /** Controlled theme preference — checked state of the theme rows. */
  theme?: UserMenuTheme
  onThemeChange?: (theme: UserMenuTheme) => void
  /**
   * Labels for the theme rows — one checkable row renders per label given,
   * so apps opt into exactly the options they support (provide `dark` only
   * for a single "Dark Mode" toggle row; `light`/`dark`/`system` for the
   * full appearance section).
   */
  themeLabels?: { light?: string; dark?: string; system?: string }
  /** Controlled language — checked state of the language rows. */
  language?: string
  onLanguageChange?: (id: string) => void
  /** Rendered as checkable rows when `language`/`onLanguageChange` are set. */
  languages?: UserMenuLanguage[]
  /** App entries (My Profile, Setup, Settings, Integrations, About…). */
  items?: UserMenuItem[]
  onItemSelect?: (id: string) => void
  /** When set, renders the danger logout row at the bottom. */
  onLogout?: () => void
  logoutLabel?: string
  align?: 'start' | 'end'
  labels?: { openMenu?: string; account?: string }
  icons?: UserMenuIcons
  className?: string
  triggerClassName?: string
  /** Extra classes for the panel — e.g. width or `overflow-visible` when a
   * switcher slot renders its own floating panel. */
  contentClassName?: string
}

const THEME_ORDER: UserMenuTheme[] = ['light', 'dark', 'system']

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

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

const statusToneClass: Record<UserMenuStatusTone, string> = {
  success: 'bg-[var(--as-success)]/10 text-[var(--as-success)]',
  info: 'bg-[var(--as-primary)]/10 text-[var(--as-primary)]',
  warning: 'bg-[var(--as-warning)]/10 text-[var(--as-warning)]',
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  function UserMenu(
    {
      user,
      name,
      email,
      avatarUrl,
      initials,
      roleBadge,
      switcher,
      status,
      theme,
      onThemeChange,
      themeLabels,
      language,
      onLanguageChange,
      languages,
      items,
      onItemSelect,
      onLogout,
      logoutLabel,
      align = 'end',
      labels,
      icons,
      className,
      triggerClassName,
      contentClassName,
    },
    ref,
  ) {
    const identityName = user?.name ?? name
    const identityEmail = user?.email ?? email
    const identityAvatarUrl = user?.avatarUrl ?? avatarUrl
    const badge = roleBadge ?? user?.role
    const hasIdentity = Boolean(identityName || identityEmail || badge)

    const disc = initials ?? deriveInitials(identityName)
    const menuItemList = items ?? []
    const languageRows = language !== undefined && onLanguageChange !== undefined ? (languages ?? []) : []
    const themeRows =
      theme !== undefined && onThemeChange !== undefined
        ? THEME_ORDER.filter((id) => themeLabels?.[id] !== undefined)
        : []

    const resolvedIcons = {
      logout: icons?.logout ?? LogOut,
      language: icons?.language ?? Globe,
      themeLight: icons?.themeLight ?? Sun,
      themeDark: icons?.themeDark ?? Moon,
      themeSystem: icons?.themeSystem ?? Monitor,
    }

    // Switcher slots (tenant/profile pickers) embed real form controls.
    // Radix menu content runs typeahead on every character keydown, which
    // would yank focus out of those inputs — swallow keydowns from typing
    // targets (Escape and Tab keep their menu semantics: close / trap).
    const handleNestedKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') return
      if (isTypingTarget(event.target)) event.stopPropagation()
    }

    const themeIcon = (id: UserMenuTheme) =>
      id === 'light' ? resolvedIcons.themeLight : id === 'dark' ? resolvedIcons.themeDark : resolvedIcons.themeSystem

    const selectTheme = (id: UserMenuTheme) => {
      if (themeRows.length === 1) {
        // Single toggle row ("Dark Mode"): selecting the active option
        // means turning it off.
        onThemeChange?.(theme === id ? (id === 'dark' ? 'light' : 'dark') : id)
      } else {
        onThemeChange?.(id)
      }
    }

    return (
      <div ref={ref} data-as="user-menu" className={cn('inline-flex', className)}>
        <Menu>
          <MenuTrigger
            type="button"
            aria-label={labels?.openMenu ?? 'Open user menu'}
            aria-haspopup="menu"
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-full p-1 pr-3 transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
              triggerClassName,
            )}
          >
            {identityAvatarUrl ? (
              <img
                src={identityAvatarUrl}
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
            {identityName || identityEmail ? (
              <span className="flex min-w-0 flex-col text-left leading-tight">
                {identityName ? (
                  <span className="max-w-40 truncate text-sm font-medium text-[var(--as-fg)]">
                    {identityName}
                  </span>
                ) : null}
                {identityEmail ? (
                  <span className="max-w-40 truncate text-xs text-[var(--as-muted-fg)]">
                    {identityEmail}
                  </span>
                ) : null}
              </span>
            ) : null}
          </MenuTrigger>
          <MenuContent
            align={align}
            sideOffset={8}
            className={cn('min-w-48', contentClassName)}
          >
            <div className="contents" onKeyDown={handleNestedKeyDown}>
              {switcher !== undefined ? (
                <>
                  <div role="group" className="p-1.5 pb-2">
                    {switcher}
                  </div>
                  <MenuSeparator />
                </>
              ) : null}

              {hasIdentity ? (
                <>
                  {labels?.account ? <MenuLabel>{labels.account}</MenuLabel> : null}
                  <div className="flex items-center gap-2.5 px-2 py-1.5">
                    {identityAvatarUrl ? (
                      <img
                        src={identityAvatarUrl}
                        alt=""
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--as-primary)] text-xs font-bold text-[var(--as-primary-fg)]"
                      >
                        {disc || <UserGlyph />}
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      {identityName ? (
                        <span className="truncate text-sm font-bold text-[var(--as-fg)]">
                          {identityName}
                        </span>
                      ) : null}
                      {identityEmail ? (
                        <span className="truncate text-xs text-[var(--as-muted-fg)]">
                          {identityEmail}
                        </span>
                      ) : null}
                      {badge ? (
                        <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-[var(--as-secondary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--as-muted-fg)]">
                          {badge}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </>
              ) : null}

              {status !== undefined ? (
                <>
                  {(switcher !== undefined || hasIdentity) && <MenuSeparator />}
                  <div className="px-2 py-1.5">
                    <span
                      data-as="user-menu-status"
                      className={cn(
                        'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                        statusToneClass[status.tone ?? 'info'],
                      )}
                    >
                      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
                      <span className="truncate">{status.label}</span>
                    </span>
                  </div>
                </>
              ) : null}

              {(languageRows.length > 0 || themeRows.length > 0) && <MenuSeparator />}

              {languageRows.map((lang) => (
                <MenuCheckboxItem
                  key={`lang-${lang.id}`}
                  icon={resolvedIcons.language}
                  checked={language === lang.id}
                  onSelect={() => onLanguageChange?.(lang.id)}
                >
                  {lang.label}
                </MenuCheckboxItem>
              ))}

              {themeRows.map((id) => (
                <MenuCheckboxItem
                  key={`theme-${id}`}
                  icon={themeIcon(id)}
                  checked={theme === id}
                  onSelect={() => selectTheme(id)}
                >
                  {themeLabels?.[id]}
                </MenuCheckboxItem>
              ))}

              {menuItemList.length > 0 &&
              (switcher !== undefined || hasIdentity || status !== undefined || languageRows.length > 0 || themeRows.length > 0) ? (
                <MenuSeparator />
              ) : null}

              {menuItemList.map((item) =>
                item.checked !== undefined ? (
                  <MenuCheckboxItem
                    key={item.id}
                    icon={item.icon}
                    danger={item.tone === 'danger'}
                    disabled={item.disabled}
                    pending={item.pending}
                    checked={item.checked}
                    onSelect={() => onItemSelect?.(item.id)}
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
                    onSelect={() => onItemSelect?.(item.id)}
                  >
                    {item.label}
                  </MenuItem>
                ),
              )}

              {onLogout ? (
                <>
                  <MenuSeparator />
                  <MenuItem danger icon={resolvedIcons.logout} onSelect={() => onLogout()}>
                    {logoutLabel ?? 'Log out'}
                  </MenuItem>
                </>
              ) : null}
            </div>
          </MenuContent>
        </Menu>
      </div>
    )
  },
)
