import * as React from 'react'
import { cn } from '../../lib/utils'
import { Badge } from '../badge/Badge'
import { CareerMark } from '../logo/CareerMark'
import { HealthMark } from '../logo/HealthMark'
import { StudyMark } from '../logo/StudyMark'
import type { LogoTheme } from '../logo/Logo'
import { AboutCard } from './AboutCard'
import { AboutFooterLine } from './AboutFooterLine'
import { AboutLinkList, type AboutLinkItem } from './AboutLinkList'
import { AboutNote } from './AboutNote'
import { FamilyBadge, type FamilyApp, type FamilyMember } from './FamilyBadge'
import {
  SponsorCard,
  type SponsorChannel,
} from './SponsorCard'
import { TechChips } from './TechChips'

export interface AboutCreator {
  name: React.ReactNode
  role?: React.ReactNode
  href?: string
  links?: ReadonlyArray<AboutLinkItem>
}

export interface AboutLicense {
  name: string
  href?: string
}

export interface AboutNoteContent {
  tone?: 'info' | 'warning'
  title?: React.ReactNode
  children: React.ReactNode
}

export interface AboutSponsorContent {
  channels: ReadonlyArray<SponsorChannel>
  title?: React.ReactNode
  description?: React.ReactNode
  footnote?: React.ReactNode
  channelsLabel?: string
}

export interface AboutPanelProps extends React.ComponentProps<'div'> {
  appName: string
  familyCurrent?: FamilyApp
  logo?: React.ReactNode
  tagline?: React.ReactNode
  description?: React.ReactNode
  version?: string
  license?: AboutLicense
  licenseTitle?: string
  licenseLinkLabel?: string
  links?: ReadonlyArray<AboutLinkItem>
  linksTitle?: string
  creator?: AboutCreator
  creatorTitle?: string
  tech?: ReadonlyArray<string>
  techTitle?: string
  note?: AboutNoteContent
  sponsor?: AboutSponsorContent
  familyMembers?: ReadonlyArray<FamilyMember>
  hubUrl?: string
  familyLabel?: string
  familyBlurb?: React.ReactNode
  familyCtaLabel?: string
  familyCurrentLabel?: string
  theme?: LogoTheme
  copyright?: React.ReactNode
}

const marks = {
  health: HealthMark,
  career: CareerMark,
  study: StudyMark,
} as const

export const AboutPanel = React.forwardRef<HTMLDivElement, AboutPanelProps>(
  function AboutPanel(
    {
      appName,
      familyCurrent,
      logo,
      tagline,
      description,
      version,
      license,
      licenseTitle = 'License & open source',
      licenseLinkLabel = 'Read license',
      links,
      linksTitle = 'Links',
      creator,
      creatorTitle = 'Created by',
      tech,
      techTitle = 'Built with',
      note,
      sponsor,
      familyMembers,
      hubUrl,
      familyLabel,
      familyBlurb,
      familyCtaLabel,
      familyCurrentLabel,
      theme = 'light',
      copyright,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const DefaultMark = familyCurrent ? marks[familyCurrent] : null
    return (
      <div
        ref={ref}
        data-as="about-panel"
        className={cn('flex w-full flex-col gap-6', className)}
        {...props}
      >
        <section className="flex items-start gap-5">
          {logo ?? (DefaultMark ? <DefaultMark size={72} theme={theme} /> : null)}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--as-fg)]">
                {appName}
              </h1>
              {version ? (
                <Badge variant="outline" data-as="about-version">
                  v{version}
                </Badge>
              ) : null}
            </div>
            {tagline ? (
              <p className="text-sm font-medium text-[var(--as-muted-fg)]">{tagline}</p>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--as-muted-fg)]">
                {description}
              </p>
            ) : null}
          </div>
        </section>

        {creator || license || links?.length ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {creator && !familyCurrent ? (
              <AboutCard title={creatorTitle}>
                <p className="font-semibold text-[var(--as-fg)]">{creator.name}</p>
                {creator.role ? (
                  <p className="mb-3 text-sm text-[var(--as-muted-fg)]">{creator.role}</p>
                ) : null}
                {creator.links?.length ? <AboutLinkList links={creator.links} /> : null}
              </AboutCard>
            ) : null}
            {license ? (
              <AboutCard title={licenseTitle}>
                <div className="flex items-center justify-between gap-3 rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-muted)] px-4 py-3">
                  <span className="font-semibold text-[var(--as-fg)]">{license.name}</span>
                  {license.href ? (
                    <a
                      href={license.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[var(--as-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]"
                    >
                      {licenseLinkLabel}
                    </a>
                  ) : null}
                </div>
              </AboutCard>
            ) : null}
            {links?.length ? (
              <AboutCard title={linksTitle}>
                <AboutLinkList links={links} />
              </AboutCard>
            ) : null}
          </section>
        ) : null}

        {sponsor ? (
          <SponsorCard
            channels={sponsor.channels}
            title={sponsor.title}
            description={sponsor.description}
            footnote={sponsor.footnote}
            channelsLabel={sponsor.channelsLabel}
          />
        ) : null}

        {tech?.length ? (
          <AboutCard title={techTitle}>
            <TechChips items={tech} />
          </AboutCard>
        ) : null}

        {note ? (
          <AboutNote tone={note.tone} title={note.title}>
            {note.children}
          </AboutNote>
        ) : null}

        {familyCurrent ? (
          <FamilyBadge
            current={familyCurrent}
            members={familyMembers}
            creator={
              creator
                ? { name: creator.name, role: creator.role, href: creator.href }
                : undefined
            }
            creatorLabel={creatorTitle}
            hubUrl={hubUrl}
            label={familyLabel}
            blurb={familyBlurb}
            ctaLabel={familyCtaLabel}
            currentLabel={familyCurrentLabel}
            theme={theme}
          />
        ) : null}

        {version || copyright ? (
          <AboutFooterLine version={version} copyright={copyright} />
        ) : null}

        {children}
      </div>
    )
  },
)
