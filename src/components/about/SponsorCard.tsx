import * as React from 'react'
import { ArrowUpRight, Heart } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SponsorChannel {
  id: string
  name: React.ReactNode
  href: string
  description?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
  highlight?: boolean
}

export interface SponsorCardProps
  extends Omit<React.ComponentProps<'section'>, 'title'> {
  channels: ReadonlyArray<SponsorChannel>
  title?: React.ReactNode
  description?: React.ReactNode
  footnote?: React.ReactNode
  channelsLabel?: string
  /** Channel list columns. `auto` = one column below the `sm` viewport
   * breakpoint, two above; `1`/`2` force a count (use `1` inside narrow
   * surfaces like modals — breakpoints track the viewport, not the card). */
  columns?: 'auto' | 1 | 2
  icon?: React.ReactNode
  heading?: 'h2' | 'h3' | 'h4'
}

const rowBase =
  'group flex w-full items-center gap-2.5 rounded-[var(--as-radius)] px-2.5 py-2 text-left no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]'

export const SponsorCard = React.forwardRef<HTMLElement, SponsorCardProps>(
  function SponsorCard(
    {
      channels,
      title = 'Support this project',
      description = 'This project is free and open source. Contributions directly fund servers, maintenance and new development.',
      footnote = 'Every contribution keeps the project independent and free.',
      channelsLabel = 'Ways to support',
      columns = 'auto',
      icon,
      heading: Heading = 'h2',
      className,
      children,
      ...props
    },
    ref,
  ) {
    if (channels.length === 0) return null
    return (
      <section
        ref={ref}
        data-as="sponsor-card"
        className={cn(
          'flex flex-col gap-3 rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <Heading
            data-as="sponsor-title"
            className="flex items-center gap-2 text-base font-bold leading-tight tracking-tight text-[var(--as-fg)]"
          >
            {icon ?? (
              <Heart
                aria-hidden
                className="size-[18px] shrink-0 fill-[var(--as-danger)] text-[var(--as-danger)]"
              />
            )}
            {title}
          </Heading>
          {description ? (
            <p className="text-xs leading-relaxed text-[var(--as-muted-fg)]">
              {description}
            </p>
          ) : null}
          {footnote ? (
            <p className="text-xs leading-relaxed text-[var(--as-muted-fg)]">
              {footnote}
            </p>
          ) : null}
        </div>

        <ul
          data-as="sponsor-channels"
          aria-label={channelsLabel}
          className={cn(
            'grid list-none gap-1.5',
            columns === 'auto' && 'grid-cols-1 sm:grid-cols-2',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'grid-cols-2',
          )}
        >
          {channels.map((channel) => {
            const Icon = channel.icon ?? Heart
            const external = channel.external !== false
            return (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  data-as="sponsor-channel"
                  data-as-channel={channel.id}
                  data-as-highlight={channel.highlight ? 'true' : undefined}
                  className={cn(
                    rowBase,
                    channel.highlight
                      ? 'border border-[color-mix(in_srgb,var(--as-primary)_40%,transparent)] hover:border-[var(--as-primary)]'
                      : 'border border-[var(--as-border)] bg-[var(--as-surface-raised)] hover:border-[var(--as-primary)]',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-[var(--as-radius-sm)]',
                      channel.highlight
                        ? 'text-[var(--as-primary)]'
                        : 'bg-[var(--as-secondary)] text-[var(--as-secondary-fg)]',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'truncate text-sm',
                        channel.highlight
                          ? 'font-semibold text-[var(--as-primary)]'
                          : 'font-medium text-[var(--as-fg)]',
                      )}
                    >
                      {channel.name}
                    </span>
                    {channel.description ? (
                      <span className="block truncate text-xs text-[var(--as-muted-fg)]">
                        {channel.description}
                      </span>
                    ) : null}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-[var(--as-muted-fg)] transition-colors group-hover:text-[var(--as-primary)]"
                  />
                </a>
              </li>
            )
          })}
        </ul>

        {children}
      </section>
    )
  },
)
