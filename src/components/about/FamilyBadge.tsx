import * as React from 'react'
import { ArrowUpRight, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LogoTheme } from '../logo/Logo'
import { NeuronectionMark } from '../logo/NeuronectionMark'
import { NeuronectionWordmark } from '../logo/NeuronectionWordmark'
import { CareerMark } from '../logo/CareerMark'
import { HealthMark } from '../logo/HealthMark'
import { StudyMark } from '../logo/StudyMark'

const GitHubGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

export type FamilyApp = 'health' | 'career' | 'study'

export interface FamilyMember {
  app: FamilyApp
  name: string
  tagline?: string
  href?: string
  github?: string
  website?: string
}

export interface FamilyCreator {
  name: React.ReactNode
  role?: React.ReactNode
  href?: string
}

export interface FamilyBadgeProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  current: FamilyApp
  members?: ReadonlyArray<FamilyMember>
  creator?: FamilyCreator
  creatorLabel?: string
  hubUrl?: string
  label?: string
  blurb?: React.ReactNode
  ctaLabel?: string
  currentLabel?: string
  githubLabel?: string
  websiteLabel?: string
  theme?: LogoTheme
}

const marks = {
  health: HealthMark,
  career: CareerMark,
  study: StudyMark,
} as const

const defaultMembers: Record<FamilyApp, { name: string; tagline: string; href: string; github: string; website?: string }> = {
  health: {
    name: 'Health Assistant',
    tagline: 'Self-hosted, privacy-first health records with AI insights',
    href: 'https://neuronection.com/en/health/',
    github: 'https://github.com/health-assistant-io/health-assistant',
    website: 'https://health-assistant.io',
  },
  career: {
    name: 'Career Assistant',
    tagline: 'Open-source career explorer with transparent AI matching',
    href: 'https://neuronection.com/en/career/',
    github: 'https://github.com/neuronection/career-assistant',
  },
  study: {
    name: 'Study Assistant',
    tagline: 'Local-first study workbench that runs in your browser',
    href: 'https://neuronection.com/en/study/',
    github: 'https://github.com/neuronection/study-assistant',
  },
}

const defaultOrder: FamilyApp[] = ['health', 'career', 'study']

const defaultBlurb =
  'Neuronection is a family of open-source, self-hosted AI assistants — one connected ecosystem for life\u2019s important choices. Every assistant in the family shares the same principles: deeply structured data instead of text dumps, AI that explains its reasoning, and you in control of your information.'

export const FamilyBadge = React.forwardRef<HTMLDivElement, FamilyBadgeProps>(
  function FamilyBadge(
    {
      current,
      members,
      creator,
      creatorLabel = 'Created by',
      hubUrl = 'https://neuronection.com',
      label = 'Part of the Neuronection family',
      blurb = defaultBlurb,
      ctaLabel = 'Visit neuronection.com',
      currentLabel = 'Current app',
      githubLabel = 'GitHub',
      websiteLabel = 'Website',
      theme = 'light',
      className,
      ...props
    },
    ref,
  ) {
    const list = members ?? defaultOrder.map((app) => ({ app, ...defaultMembers[app] }))
    return (
      <section
        ref={ref}
        data-as="family-badge"
        aria-label={label}
        className={cn(
          'flex flex-col gap-5 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6 shadow-[var(--as-shadow-1)] sm:p-8',
          className,
        )}
        {...props}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <a
            href={hubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex items-center gap-3 rounded-[var(--as-radius)] p-1 transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
          >
            <NeuronectionMark size={44} theme={theme} />
            <NeuronectionWordmark size={24} theme={theme} />
          </a>
          <a
            href={hubUrl}
            target="_blank"
            rel="noreferrer"
            data-as="family-cta"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--as-primary)] py-2 pl-5 pr-2 text-sm font-semibold text-[var(--as-primary-fg)] shadow-[var(--as-shadow-2)] transition-shadow hover:shadow-[var(--as-shadow-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
          >
            {ctaLabel}
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--as-primary-fg)_20%,transparent)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--as-primary-fg)_32%,transparent)]"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </div>

        {blurb ? (
          <p className="max-w-2xl text-base leading-relaxed text-[var(--as-muted-fg)]">
            {blurb}
          </p>
        ) : null}

        <ul className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
          {list.map((member) => {
            const Mark = marks[member.app]
            const isCurrent = member.app === current
            const card = cn(
              'group flex h-full flex-col rounded-[var(--as-radius)] border p-5 pt-6 text-center transition-[color,box-shadow] hover:shadow-[var(--as-shadow-2)]',
              isCurrent
                ? 'border-[var(--as-primary)] bg-[color-mix(in_srgb,var(--as-primary)_7%,transparent)] ring-2 ring-[var(--as-primary)]'
                : 'border-[var(--as-border)] bg-[var(--as-muted)] hover:border-[var(--as-primary)]',
            )
            const linkExtras =
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]'
            const header = (
              <>
                <Mark size={56} theme={theme} />
                {member.href && !isCurrent ? (
                  <span className="text-base font-bold leading-snug text-[var(--as-primary)] underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                    {member.name}
                  </span>
                ) : (
                  <span className="text-base font-bold leading-snug text-[var(--as-fg)]">
                    {member.name}
                  </span>
                )}
                {member.tagline ? (
                  <span className="text-sm leading-relaxed text-[var(--as-muted-fg)]">
                    {member.tagline}
                  </span>
                ) : null}
                {isCurrent ? (
                  <span className="mt-1 rounded-full bg-[var(--as-primary)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--as-primary-fg)]">
                    {currentLabel}
                  </span>
                ) : null}
              </>
            )
            return (
              <li key={member.app} data-current={isCurrent ? 'true' : undefined} className="flex">
                <div className={cn(card, 'w-full')}>
                  {member.href && !isCurrent ? (
                    <a
                      href={member.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn('flex flex-1 flex-col items-center gap-2.5', linkExtras)}
                    >
                      {header}
                    </a>
                  ) : (
                    <div className="flex flex-1 flex-col items-center gap-2.5">{header}</div>
                  )}
                  {member.github || member.website ? (
                    <div className="mt-5 flex items-center justify-center gap-2 border-t border-[var(--as-border)] pt-4">
                      {member.github ? (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${member.name} on GitHub`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--as-muted-fg)] transition-colors hover:border-[var(--as-primary)] hover:text-[var(--as-primary)] focus-visible:border-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
                        >
                          <GitHubGlyph className="size-4" />
                          {githubLabel}
                        </a>
                      ) : null}
                      {member.website ? (
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${member.name} website`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--as-muted-fg)] transition-colors hover:border-[var(--as-primary)] hover:text-[var(--as-primary)] focus-visible:border-[var(--as-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
                        >
                          <Globe aria-hidden className="size-4" />
                          {websiteLabel}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        {creator ? (
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-[var(--as-border)] pt-4 text-xs text-[var(--as-muted-fg)]">
            <span>{creatorLabel}</span>
            {creator.href ? (
              <a
                href={creator.href}
                target="_blank"
                rel="noreferrer"
                className="rounded font-semibold text-[var(--as-fg)] transition-colors hover:text-[var(--as-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
              >
                {creator.name}
              </a>
            ) : (
              <span className="font-semibold text-[var(--as-fg)]">{creator.name}</span>
            )}
            {creator.role ? <span>· {creator.role}</span> : null}
          </p>
        ) : null}
      </section>
    )
  },
)
