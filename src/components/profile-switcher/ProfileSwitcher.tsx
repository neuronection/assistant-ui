import * as React from 'react'
import {
  Check,
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

function ProfileAvatar({ profile }: { profile: ProfileItem }) {
  const letter = (profile.name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
      style={
        profile.color
          ? { backgroundColor: `${profile.color}22`, color: profile.color }
          : {
              backgroundColor: 'var(--as-secondary)',
              color: 'var(--as-muted-fg)',
            }
      }
    >
      {profile.color ? letter : <UserRound className="size-3.5" />}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-haspopup="dialog"
              aria-label={merged.trigger}
            >
              <TriggerIcon aria-hidden />
              <span className="max-w-32 truncate">{current ? current.name : merged.empty}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align={align}
            role="dialog"
            aria-label={merged.panelTitle}
            className="w-72 p-2"
            onEscapeKeyDown={(event) => {
              // Escape cancels an inline rename first, closes the panel
              // only on the second press.
              if (renamingId !== null) event.preventDefault()
            }}
          >
            <div className="px-2 pb-1 pt-1 text-xs font-medium text-[var(--as-muted-fg)]">
              {merged.panelTitle}
            </div>
            {loading ? (
              <p className="px-2 py-3 text-sm text-[var(--as-muted-fg)]">{merged.loading}</p>
            ) : profiles.length === 0 ? (
              <p className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--as-muted-fg)]">
                <EmptyIcon aria-hidden />
                {merged.empty}
              </p>
            ) : (
              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {profiles.map((profile) => {
                  const isCurrent = current !== null && profile.id === current.id
                  return (
                    <li
                      key={profile.id}
                      className="group flex items-center gap-1 rounded-[var(--as-radius-sm)] px-1 py-0.5 hover:bg-[var(--as-secondary)]"
                    >
                      {renamingId === profile.id ? (
                        <form
                          className="flex w-full items-center gap-1"
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
                            className="h-7 flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!renameDraft.trim()}
                            aria-label={merged.renameSubmit}
                          >
                            {merged.renameSubmit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
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
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--as-radius-sm)] px-1.5 py-1 text-left text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
                            onClick={() => {
                              onSelect(profile)
                              close()
                            }}
                          >
                            <ProfileAvatar profile={profile} />
                            <span className="min-w-0 flex-1 truncate">{profile.name}</span>
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--as-muted-fg)]">
                                <Check aria-hidden />
                                {merged.currentBadge}
                              </span>
                            ) : null}
                            {profile.is_default ? (
                              <span className="text-[10px] text-[var(--as-muted-fg)]">
                                {merged.defaultBadge}
                              </span>
                            ) : null}
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={merged.rename(profile.name)}
                            onClick={() => startRename(profile)}
                          >
                            <RenameIcon aria-hidden />
                          </Button>
                          {onSetDefault && !profile.is_default ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              aria-label={merged.setDefault(profile.name)}
                              onClick={() => void onSetDefault(profile)}
                            >
                              <SetDefaultIcon aria-hidden />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={merged.delete(profile.name)}
                            onClick={() => void onDelete(profile)}
                          >
                            <DeleteIcon aria-hidden />
                          </Button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            {error ? (
              <p role="alert" className="px-2 py-1 text-xs text-[var(--as-danger)]">
                {error}
              </p>
            ) : null}
            <form
              className="mt-2 flex items-center gap-1 border-t border-[var(--as-border)] pt-2"
              onSubmit={(event) => {
                void submitCreate(event)
              }}
            >
              <Input
                aria-label={merged.newProfile}
                placeholder={merged.newProfilePlaceholder}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="h-7 flex-1"
              />
              <Button
                type="submit"
                size="sm"
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
