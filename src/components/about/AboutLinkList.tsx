import * as React from 'react'
import { ArrowUpRight, Check, Copy, Link2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface AboutLinkItem {
  href?: string
  label: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
  group?: React.ReactNode
  copyValue?: string
  copyLabel?: string
  copiedLabel?: string
}

export interface AboutLinkListProps extends React.ComponentProps<'ul'> {
  links: ReadonlyArray<AboutLinkItem>
}

const rowClass =
  'group flex w-full items-center gap-3 rounded-[var(--as-radius)] p-2 text-left transition-colors hover:bg-[var(--as-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-primary)]'

const tileClass =
  'flex size-10 shrink-0 items-center justify-center rounded-[var(--as-radius)] bg-[var(--as-secondary)] text-[var(--as-secondary-fg)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--as-secondary-fg)_14%,transparent)] [&_svg]:size-5'

interface CopyRowProps {
  value: string
  icon?: React.ComponentType<{ className?: string }>
  label?: React.ReactNode
  subtitle?: React.ReactNode
  copyLabel?: string
  copiedLabel?: string
}

const CopyRow = ({
  value,
  icon: Icon = Link2,
  label,
  subtitle,
  copyLabel = 'Copy to clipboard',
  copiedLabel = 'Copied!',
}: CopyRowProps) => {
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])
  const onCopy = () => {
    void navigator.clipboard?.writeText(value).then(() => setCopied(true))
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      data-as="about-copy-row"
      aria-label={`${typeof label === 'string' ? label : copyLabel} — ${copyLabel}`}
      className={rowClass}
    >
      <span aria-hidden className={tileClass}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--as-fg)] transition-colors group-hover:text-[var(--as-primary)]">
          {label}
        </span>
        <span className="block truncate text-xs text-[var(--as-muted-fg)]">
          {copied ? copiedLabel : subtitle}
        </span>
      </span>
      {copied ? (
        <Check aria-hidden className="size-4 shrink-0 text-[var(--as-success)]" />
      ) : (
        <Copy
          aria-hidden
          className="size-4 shrink-0 text-[var(--as-muted-fg)] opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </button>
  )
}

export const AboutLinkList = React.forwardRef<HTMLUListElement, AboutLinkListProps>(
  function AboutLinkList({ links, className, ...props }, ref) {
    let lastGroup: React.ReactNode | undefined
    return (
      <ul
        ref={ref}
        data-as="about-link-list"
        className={cn('flex flex-col gap-0.5', className)}
        {...props}
      >
        {links.map((link, index) => {
          const Icon = link.icon ?? Link2
          const external = link.external !== false
          const heading =
            link.group !== undefined && link.group !== lastGroup ? link.group : null
          lastGroup = link.group
          return (
            <li key={index}>
              {heading !== null ? (
                <p
                  className={cn(
                    'mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--as-muted-fg)]',
                    index > 0 && 'mt-4',
                  )}
                >
                  {heading}
                </p>
              ) : null}
              {link.copyValue && !link.href ? (
                <CopyRow
                  value={link.copyValue}
                  icon={link.icon}
                  label={link.label}
                  subtitle={link.subtitle}
                  copyLabel={link.copyLabel}
                  copiedLabel={link.copiedLabel}
                />
              ) : (
                <a
                  href={link.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className={rowClass}
                >
                  <span aria-hidden className={tileClass}>
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--as-fg)] transition-colors group-hover:text-[var(--as-primary)]">
                      {link.label}
                    </span>
                    {link.subtitle ? (
                      <span className="block truncate text-xs text-[var(--as-muted-fg)]">
                        {link.subtitle}
                      </span>
                    ) : null}
                  </span>
                  {external ? (
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 shrink-0 text-[var(--as-muted-fg)] opacity-60 transition-opacity group-hover:opacity-100"
                    />
                  ) : null}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    )
  },
)
