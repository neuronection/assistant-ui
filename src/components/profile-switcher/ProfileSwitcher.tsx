import * as React from 'react'
import {
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Star,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/Popover'

export interface ProfileItem {
  id: string
  name: string
  is_default?: boolean
  color?: string | null
}

export interface ProfileSwitcherLabels {
  trigger: string
  panelTitle: string
  currentBadge: string
  defaultBadge: string
  newProfile: string
  newProfilePlaceholder: string
  create: string
  rename: (name: string) => string
  renamePlaceholder: string
  renameSubmit: string
  setDefault: (name: string) => string
  delete: (name: string) => string
  cancel: string
  loading: string
  empty: string
}

export interface ProfileSwitcherIcons {
  trigger?: LucideIcon
  create?: LucideIcon
  rename?: LucideIcon
  setDefault?: LucideIcon
  delete?: LucideIcon
  empty?: LucideIcon
}

export interface ProfileSwitcherProps {
  profiles: ProfileItem[]
  currentId: string | null
  onSelect: (profile: ProfileItem) => void
  onCreate: (name: string) => void | Promise<unknown>
  onRename: (profile: ProfileItem, name: string) => void | Promise<unknown>
  onDelete: (profile: ProfileItem) => void | Promise<unknown>
  /** When given, rows expose a "make Default" action (identity-auth §12). */
  onSetDefault?: (profile: ProfileItem) => void | Promise<unknown>
  loading?: boolean
  error?: string | null
  align?: 'start' | 'end'
  labels?: Partial<ProfileSwitcherLabels>
  icons?: ProfileSwitcherIcons
  className?: string
}

const defaultLabels: ProfileSwitcherLabels = {
  trigger: 'Switch profile',
  panelTitle: 'Profiles',
  currentBadge: 'Current',
  defaultBadge: 'Default',
  newProfile: 'New profile',
  newProfilePlaceholder: 'Profile name',
  create: 'Create',
  rename: (name) => `Rename ${name}`,
  renamePlaceholder: 'Profile name',
  renameSubmit: 'Save',
  setDefault: (name) => `Make ${name} the default profile`,
  delete: (name) => `Delete ${name}`,
  cancel: 'Cancel',
  loading: 'Loading profiles…',
  empty: 'No profiles yet',
}

function ProfileAvatar({
  profile,
  size = 'sm',
}: {
  profile: ProfileItem
  size?: 'sm' | 'md'
}) {
  const letter = (profile.name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-[var(--as-border)]',
        size === 'md' ? 'size-8 text-xs' : 'size-6 text-[10px]',
      )}
      style={
        profile.color
          ? { backgroundColor: `${profile.color}22`, color: profile.color }
          : {
              backgroundColor: 'var(--as-secondary)',
              color: 'var(--as-muted-fg)',
            }
      }
    >
      {profile.color ? (
        letter
      ) : (
        <UserRound className={size === 'md' ? 'size-4' : 'size-3.5'} />
      )}
    </span>
  )
}

/** Status pills on a row: accent "Current" when active, muted "Default". */
function ProfileRowBadges({
  isCurrent,
  isDefault,
  currentBadge,
  defaultBadge,
}: {
  isCurrent: boolean
  isDefault: boolean
  currentBadge: string
  defaultBadge: string
}) {
  if (!isCurrent && !isDefault) return null
  return (
    <span className="flex shrink-0 items-center gap-1">
      {isCurrent ? (
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--as-accent) 12%, transparent)',
            color: 'var(--as-accent)',
          }}
        >
          <Check aria-hidden className="size-3" />
          {currentBadge}
        </span>
      ) : null}
      {isDefault ? (
        <span className="inline-flex items-center rounded-full bg-[var(--as-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--as-muted-fg)]">
          {defaultBadge}
        </span>
      ) : null}
    </span>
  )
}

export const ProfileSwitcher = React.forwardRef<HTMLDivElement, ProfileSwitcherProps>(
  function ProfileSwitcher(
    {
      profiles,
      currentId,
      onSelect,
      onCreate,
      onRename,
      onDelete,
      onSetDefault,
      loading = false,
      error = null,
      align = 'start',
      labels,
      icons,
      className,
    },
    ref,
  ) {
    const merged = { ...defaultLabels, ...labels }
    const TriggerIcon = icons?.trigger ?? UserRound
    const CreateIcon = icons?.create ?? Plus
    const RenameIcon = icons?.rename ?? Pencil
    const SetDefaultIcon = icons?.setDefault ?? Star
    const DeleteIcon = icons?.delete ?? Trash2
    const EmptyIcon = icons?.empty ?? UserRound

    const [open, setOpen] = React.useState(false)
    const [draftName, setDraftName] = React.useState('')
    const [renamingId, setRenamingId] = React.useState<string | null>(null)
    const [renameDraft, setRenameDraft] = React.useState('')
    const renameInputRef = React.useRef<HTMLInputElement>(null)

    const current = profiles.find((profile) => profile.id === currentId) ?? profiles[0] ?? null

    const close = React.useCallback(() => {
      setOpen(false)
      setRenamingId(null)
      setDraftName('')
    }, [])

    React.useEffect(() => {
      if (renamingId !== null) {
        renameInputRef.current?.focus()
        renameInputRef.current?.select()
      }
    }, [renamingId])

    const startRename = (profile: ProfileItem) => {
      setRenamingId(profile.id)
      setRenameDraft(profile.name)
    }

    const submitRename = async (profile: ProfileItem) => {
      const name = renameDraft.trim()
      if (!name || name === profile.name) {
        setRenamingId(null)
        return
      }
      await onRename(profile, name)
      setRenamingId(null)
    }

    const submitCreate = async (event: React.FormEvent) => {
      event.preventDefault()
      const name = draftName.trim()
      if (!name) return
      await onCreate(name)
      setDraftName('')
    }

    // Roving arrows: ↓/↑ (and Home/End) walk the profile rows without
    // leaving the panel; Tab keeps the DOM order (select → actions).
    const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      const rows = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-profile-row]'),
      )
      if (rows.length === 0) return
      const index = rows.indexOf(document.activeElement as HTMLButtonElement)
      let next = -1
      if (event.key === 'ArrowDown') next = index < 0 ? 0 : Math.min(index + 1, rows.length - 1)
      else if (event.key === 'ArrowUp')
        next = index < 0 ? rows.length - 1 : Math.max(index - 1, 0)
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = rows.length - 1
      if (next >= 0) {
        event.preventDefault()
        rows[next]?.focus()
      }
    }

    return (
      <div ref={ref} data-as="profile-switcher" className={cn('inline-block', className)}>
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) {
              setRenamingId(null)
              setDraftName('')
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={merged.trigger}
              data-testid="profile-trigger"
              className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {current ? (
                <ProfileAvatar profile={current} size="md" />
              ) : (
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-[var(--as-border)]"
                >
                  <TriggerIcon className="size-4 text-[var(--as-muted-fg)]" />
                </span>
              )}
              <span className="max-w-32 truncate text-sm font-medium">
                {current ? current.name : merged.empty}
              </span>
              <ChevronDown
                aria-hidden
                className="size-3.5 text-[var(--as-muted-fg)] transition-transform duration-150 [[data-state=open]>&]:rotate-180"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align={align}
            role="dialog"
            aria-label={merged.panelTitle}
            className="w-80 p-1.5 shadow-[var(--as-shadow-pop)] backdrop-blur-xl"
            onEscapeKeyDown={(event) => {
              // Escape cancels an inline rename first, closes the panel
              // only on the second press.
              if (renamingId !== null) event.preventDefault()
            }}
          >
            <div className="flex items-center justify-between px-2 pb-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--as-muted-fg)]">
                {merged.panelTitle}
              </span>
              {profiles.length > 0 ? (
                <span className="text-[11px] tabular-nums text-[var(--as-muted-fg)]">
                  {profiles.length}
                </span>
              ) : null}
            </div>
            {loading ? (
              <p
                className="as-anim-fade px-2 py-3 text-sm text-[var(--as-muted-fg)]"
                role="status"
              >
                {merged.loading}
              </p>
            ) : profiles.length === 0 ? (
              <p className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--as-muted-fg)]">
                <EmptyIcon aria-hidden className="size-4" />
                {merged.empty}
              </p>
            ) : (
              <ul
                className="max-h-72 space-y-0.5 overflow-y-auto"
                onKeyDown={onListKeyDown}
              >
                {profiles.map((profile) => {
                  const isCurrent = current !== null && profile.id === current.id
                  return (
                    <li
                      key={profile.id}
                      className="flex items-center gap-1 rounded-[var(--as-radius-sm)] px-0.5 py-0.5 hover:bg-[var(--as-secondary)]"
                    >
                      {renamingId === profile.id ? (
                        <form
                          className="flex w-full items-center gap-1 py-0.5"
                          onSubmit={(event) => {
                            event.preventDefault()
                            void submitRename(profile)
                          }}
                        >
                          <Input
                            ref={renameInputRef}
                            aria-label={merged.rename(profile.name)}
                            placeholder={merged.renamePlaceholder}
                            value={renameDraft}
                            onChange={(event) => setRenameDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') {
                                event.preventDefault()
                                setRenamingId(null)
                              }
                            }}
                            className="h-8 flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="h-8"
                            disabled={!renameDraft.trim()}
                            aria-label={merged.renameSubmit}
                          >
                            {merged.renameSubmit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            aria-label={merged.cancel}
                            onClick={() => setRenamingId(null)}
                          >
                            {merged.cancel}
                          </Button>
                        </form>
                      ) : (
                        <>
                          <button
                            type="button"
                            aria-current={isCurrent || undefined}
                            data-profile-row
                            data-testid={`profile-option-${profile.id}`}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[var(--as-radius-sm)] px-1.5 py-1.5 text-left text-sm outline-none transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)] aria-current:bg-[color-mix(in_srgb,var(--as-accent)_8%,transparent)]"
                            onClick={() => {
                              onSelect(profile)
                              close()
                            }}
                          >
                            <ProfileAvatar profile={profile} size="md" />
                            <span className="min-w-0 flex-1 truncate font-medium">
                              {profile.name}
                            </span>
                            <ProfileRowBadges
                              isCurrent={isCurrent}
                              isDefault={Boolean(profile.is_default)}
                              currentBadge={merged.currentBadge}
                              defaultBadge={merged.defaultBadge}
                            />
                          </button>
                          <span className="flex shrink-0 items-center gap-0.5 pr-0.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 rounded-[var(--as-radius-sm)]"
                              aria-label={merged.rename(profile.name)}
                              title={merged.rename(profile.name)}
                              onClick={() => startRename(profile)}
                            >
                              <RenameIcon aria-hidden />
                            </Button>
                            {onSetDefault && !profile.is_default ? (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-[var(--as-radius-sm)]"
                                aria-label={merged.setDefault(profile.name)}
                                title={merged.setDefault(profile.name)}
                                onClick={() => void onSetDefault(profile)}
                              >
                                <SetDefaultIcon aria-hidden />
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 rounded-[var(--as-radius-sm)] hover:text-[var(--as-danger)]"
                              aria-label={merged.delete(profile.name)}
                              title={merged.delete(profile.name)}
                              onClick={() => void onDelete(profile)}
                            >
                              <DeleteIcon aria-hidden />
                            </Button>
                          </span>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            {error ? (
              <p
                role="alert"
                className="mx-1 mt-1 rounded-[var(--as-radius-sm)] bg-[color-mix(in_srgb,var(--as-danger)_10%,transparent)] px-2 py-1 text-xs text-[var(--as-danger)]"
              >
                {error}
              </p>
            ) : null}
            <form
              className="mt-1 flex items-center gap-1.5 border-t border-[var(--as-border)] p-1.5 pt-2"
              onSubmit={(event) => {
                void submitCreate(event)
              }}
            >
              <div className="relative min-w-0 flex-1">
                <CreateIcon
                  aria-hidden
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--as-muted-fg)]"
                />
                <Input
                  aria-label={merged.newProfile}
                  placeholder={merged.newProfilePlaceholder}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="h-8 pl-8"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8 gap-1 px-2.5"
                disabled={!draftName.trim()}
                aria-label={merged.create}
              >
                <CreateIcon aria-hidden />
                {merged.create}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
