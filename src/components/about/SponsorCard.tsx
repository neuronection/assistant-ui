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
  icon?: React.ReactNode
  heading?: 'h2' | 'h3' | 'h4'
}

const rowBase =
  'group flex w-full items-center gap-3 rounded-[var(--as-radius)] p-3.5 text-left no-underline transition-[color,box-shadow,border-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]'

export const SponsorCard = React.forwardRef<HTMLElement, SponsorCardProps>(
  function SponsorCard(
    {
      channels,
      title = 'Support this project',
      description = 'This project is free and open source. Contributions directly fund servers, maintenance and new development.',
      footnote = 'Every contribution keeps the project independent and free.',
      channelsLabel = 'Ways to support',
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
          'relative flex flex-col gap-4 overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-6 shadow-[var(--as-shadow-1)]',
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[var(--as-primary)] opacity-10 blur-2xl"
        />
        <div className="relative flex items-start gap-3.5">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[color-mix(in_srgb,var(--as-danger)_12%,transparent)] text-[var(--as-danger)] [&_svg]:size-5"
          >
            {icon ?? <Heart />}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
            <Heading
              data-as="sponsor-title"
              className="text-base font-semibold leading-tight tracking-tight text-[var(--as-fg)]"
            >
              {title}
            </Heading>
            {description ? (
              <p className="text-sm leading-relaxed text-[var(--as-muted-fg)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <ul
          data-as="sponsor-channels"
          aria-label={channelsLabel}
          className="relative flex list-none flex-col gap-2"
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
                      ? 'bg-[var(--as-primary)] text-[var(--as-primary-fg)] shadow-[var(--as-shadow-2)] hover:bg-[var(--as-accent-strong)] hover:shadow-[var(--as-shadow-3)]'
                      : 'border border-[var(--as-border)] bg-[var(--as-surface-raised)] hover:border-[var(--as-primary)] hover:shadow-[var(--as-shadow-2)]',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-[var(--as-radius)] transition-transform group-hover:scale-105 [&_svg]:size-[18px]',
                      channel.highlight
                        ? 'bg-[color-mix(in_srgb,var(--as-primary-fg)_18%,transparent)]'
                        : 'bg-[var(--as-secondary)] text-[var(--as-secondary-fg)]',
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm font-semibold',
                        channel.highlight
                          ? 'text-[var(--as-primary-fg)]'
                          : 'text-[var(--as-fg)]',
                      )}
                    >
                      {channel.name}
                    </span>
                    {channel.description ? (
                      <span
                        className={cn(
                          'block truncate text-xs',
                          channel.highlight
                            ? 'text-[color-mix(in_srgb,var(--as-primary-fg)_78%,transparent)]'
                            : 'text-[var(--as-muted-fg)]',
                        )}
                      >
                        {channel.description}
                      </span>
                    ) : null}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full transition-all group-hover:scale-110',
                      channel.highlight
                        ? 'bg-[color-mix(in_srgb,var(--as-primary-fg)_20%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--as-primary-fg)_32%,transparent)]'
                        : 'text-[var(--as-muted-fg)] group-hover:text-[var(--as-primary)]',
                    )}
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>

        {footnote ? (
          <p className="relative flex items-center gap-2 border-t border-[var(--as-border)] pt-4 text-xs leading-relaxed text-[var(--as-muted-fg)]">
            <Heart
              aria-hidden
              className="size-3.5 shrink-0 fill-[var(--as-danger)] text-[var(--as-danger)]"
            />
            {footnote}
          </p>
        ) : null}
        {children}
      </section>
    )
  },
)
