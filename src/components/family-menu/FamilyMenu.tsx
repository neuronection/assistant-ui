import * as React from 'react'
import { ArrowUpRight, Grip, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '../popover'
import {
  CareerMark,
  DesktopMark,
  HealthMark,
  NeuronectionMark,
  NeuronectionWordmark,
  StudyMark,
} from '../logo'
import type { LogoTheme } from '../logo'
import type { FamilyApp } from '../about/FamilyBadge'

/**
 * One family product as shown in the menu. `app` opts into the family mark
 * and the `current` marker; a custom project can pass `icon` instead and set
 * `current` explicitly.
 */
export interface FamilyProject {
  id: string
  name: string
  description?: string
  href: string
  app?: FamilyApp
  icon?: React.ReactNode
  current?: boolean
}

export interface FamilyMenuProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** The app the user is in now; its row is marked with `currentLabel`. */
  current?: FamilyApp
  /** Products to list. Defaults to Health / Career / Study / Desktop. */
  projects?: ReadonlyArray<FamilyProject>
  /** Visible trigger text. */
  label?: string
  /** Accessible trigger name; defaults to `<label> projects`. */
  ariaLabel?: string
  /** Accessible name for the dialog. */
  menuLabel?: string
  /** Muted word after the wordmark. */
  familyLabel?: string
  /** Count badge copy; return `null` to hide it. */
  countLabel?: ((count: number) => string | null) | null
  closeLabel?: string
  currentLabel?: string
  hubUrl?: string
  hubLabel?: string
  /** Rendered at the end of the menu footer when set. */
  version?: string
  theme?: LogoTheme
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  contentClassName?: string
}

const marks = {
  health: HealthMark,
  career: CareerMark,
  study: StudyMark,
  desktop: DesktopMark,
} as const

export const defaultFamilyProjects: ReadonlyArray<FamilyProject> = [
  {
    id: 'health',
    app: 'health',
    name: 'Health Assistant',
    description: 'Records and lab insights, kept on your machine.',
    href: 'https://health-assistant.io',
  },
  {
    id: 'career',
    app: 'career',
    name: 'Career Assistant',
    description: 'Transparent matching, CVs and applications.',
    href: 'https://neuronection.com/en/career/',
  },
  {
    id: 'study',
    app: 'study',
    name: 'Study Assistant',
    description: 'Courses, notes, flashcards and practice in one workbench.',
    href: 'https://neuronection.com/en/study/',
  },
  {
    id: 'desktop',
    app: 'desktop',
    name: 'Desktop Assistant',
    description: 'Tray launcher with hotkey chat and local history.',
    href: 'https://neuronection.com/en/desktop/',
  },
]

/**
 * The family switcher in a sidebar footer: one compact trigger that opens a
 * rich list of the other Neuronection assistants. Presentational only — the
 * product list, labels and hub link come in as props; links are plain
 * anchors. Radix Popover owns focus, Escape and outside-click behavior.
 */
export const FamilyMenu = React.forwardRef<HTMLButtonElement, FamilyMenuProps>(
  function FamilyMenu(
    {
      current,
      projects = defaultFamilyProjects,
      label = 'Explore',
      ariaLabel,
      menuLabel = 'Neuronection family',
      familyLabel = 'family',
      countLabel = (count) => `${count} apps`,
      closeLabel = 'Close',
      currentLabel = 'Current',
      hubUrl = 'https://neuronection.com',
      hubLabel = 'neuronection.com',
      version,
      theme = 'light',
      open,
      defaultOpen,
      onOpenChange,
      side = 'top',
      align = 'start',
      className,
      contentClassName,
      ...props
    },
    ref,
  ) {
    const count = countLabel ? countLabel(projects.length) : null

    return (
      <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={ariaLabel ?? `${label} projects`}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-2.5 text-xs font-medium text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] data-[state=open]:border-[color-mix(in_srgb,var(--as-primary)_40%,var(--as-border))] data-[state=open]:bg-[color-mix(in_srgb,var(--as-primary)_8%,transparent)] data-[state=open]:text-[var(--as-primary)] [&_svg]:shrink-0',
              className,
            )}
            {...props}
          >
            <Grip className="size-3.5" aria-hidden />
            <span>{label}</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          aria-label={menuLabel}
          data-as="family-menu"
          className={cn(
            'w-[19rem] max-w-[calc(100vw-2rem)] rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-2 text-[var(--as-fg)] shadow-[var(--as-shadow-pop)]',
            contentClassName,
          )}
        >
          <div className="flex items-center gap-2 px-1 pb-2 pt-0.5">
            <NeuronectionMark size={18} theme={theme} />
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              <NeuronectionWordmark height={12} theme={theme} />
              <span className="truncate text-[11px] font-medium text-[var(--as-muted-fg)]">
                {familyLabel}
              </span>
            </span>
            {count ? (
              <span className="shrink-0 text-[10.5px] font-semibold text-[var(--as-muted-fg)]">
                {count}
              </span>
            ) : null}
            <PopoverClose asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="-mr-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[var(--as-muted-fg)] transition-colors hover:bg-[var(--as-secondary)] hover:text-[var(--as-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
              >
                <X className="size-3" aria-hidden />
              </button>
            </PopoverClose>
          </div>

          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {projects.map((project) => {
              const isCurrent =
                project.current ?? (current !== undefined && project.app === current)
              const Mark = project.app ? marks[project.app] : null
              return (
                <li key={project.id}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name}${isCurrent ? ` (${currentLabel})` : ''}`}
                    className={cn(
                      'group flex items-start gap-2.5 rounded-[var(--as-radius-sm)] px-1.5 py-1.5 no-underline transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                      isCurrent &&
                        'bg-[color-mix(in_srgb,var(--as-primary)_7%,transparent)]',
                    )}
                  >
                    <span className="mt-px flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[7px]">
                      {project.icon ??
                        (Mark ? <Mark size={26} theme={theme} /> : null)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-[13px] font-semibold leading-tight',
                          isCurrent
                            ? 'text-[var(--as-primary)]'
                            : 'text-[var(--as-fg)]',
                        )}
                      >
                        {project.name}
                      </span>
                      {project.description ? (
                        <span className="mt-0.5 line-clamp-2 block min-h-[2.75em] text-[11.5px] leading-snug text-[var(--as-muted-fg)]">
                          {project.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 flex shrink-0 items-center">
                      {isCurrent ? (
                        <span className="whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--as-primary)_14%,transparent)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--as-primary)]">
                          {currentLabel}
                        </span>
                      ) : (
                        <ArrowUpRight
                          aria-hidden
                          className="size-3 text-[var(--as-muted-fg)] transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-[var(--as-primary)]"
                        />
                      )}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="mt-1.5 flex items-center justify-between border-t border-[var(--as-border)] px-1.5 pb-0.5 pt-2 text-[10.5px] text-[var(--as-muted-fg)]">
            <a
              href={hubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded font-semibold text-[var(--as-primary)] no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {hubLabel}
              <ArrowUpRight className="size-2.5" aria-hidden />
            </a>
            {version ? (
              <span className="font-medium text-[var(--as-muted-fg)]">{version}</span>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)
