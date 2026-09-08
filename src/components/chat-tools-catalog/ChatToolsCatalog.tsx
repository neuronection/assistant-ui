import * as React from 'react'
import { ChevronDown, Search, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { searchScore } from '../../lib/fuzzy'

export interface ChatToolCatalogArgument {
  name: string
  type?: string
  required?: boolean
  description?: string | null
}

export interface ChatToolCatalogEntry {
  /** Stable tool identifier (rendered mono). */
  name: string
  /** Human title; falls back to `name`. */
  title?: string
  description?: string
  arguments?: ChatToolCatalogArgument[]
  example?: string | null
  response?: string | null
  scope?: string | null
}

export interface ChatToolsCatalogLabels {
  /** Accessible name of the tool list. */
  tools: string
  search: string
  searchPlaceholder: string
  arguments: string
  response: string
  required: string
  optional: string
  empty: string
  noResults: string
}

export interface ChatToolsCatalogProps {
  tools: ChatToolCatalogEntry[]
  searchable?: boolean
  /** Expand every entry's details initially (uncontrolled per entry after that). */
  defaultOpen?: boolean
  labels?: Partial<ChatToolsCatalogLabels>
  icon?: LucideIcon
  className?: string
}

/**
 * Catalog of the tools an assistant can use (study's `ToolsDialog` body,
 * generalized): searchable disclosure cards with description, argument
 * list, example and response shape. Presentational only — fetching and
 * the surrounding modal/popover stay app-side.
 */
export const ChatToolsCatalog = React.forwardRef<HTMLDivElement, ChatToolsCatalogProps>(
  function ChatToolsCatalog(
    {
      tools,
      searchable = true,
      defaultOpen = false,
      labels,
      icon: Icon = Wrench,
      className,
    },
    ref,
  ) {
    const uid = React.useId()
    const [query, setQuery] = React.useState('')
    const [openOverrides, setOpenOverrides] = React.useState<Record<string, boolean>>({})

    const filtered = React.useMemo(() => {
      const trimmed = query.trim()
      if (trimmed === '') {
        return tools
      }
      return tools
        .map((tool) => ({
          tool,
          score: Math.max(
            searchScore(trimmed, tool.title ?? tool.name) ?? -1,
            searchScore(trimmed, tool.name) ?? -1,
            searchScore(trimmed, tool.description ?? '') ?? -1,
          ),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.tool)
    }, [tools, query])

    return (
      <div
        ref={ref}
        data-as="chat-tools-catalog"
        className={cn('flex min-h-0 w-full flex-col gap-2', className)}
      >
        {searchable ? (
          <div className="relative shrink-0">
            <Search
              className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--as-muted-fg)]"
              aria-hidden
            />
            <input
              type="search"
              role="searchbox"
              value={query}
              aria-label={labels?.search ?? 'Search tools'}
              placeholder={labels?.searchPlaceholder ?? 'Search…'}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] py-1.5 pe-2 ps-8 text-xs text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]"
            />
          </div>
        ) : null}
        <div role="list" aria-label={labels?.tools ?? 'Tools'} className="flex flex-col gap-2">
          {tools.length === 0 ? (
            <p className="px-1 py-3 text-xs text-[var(--as-muted-fg)]">
              {labels?.empty ?? 'No tools available'}
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-1 py-3 text-xs text-[var(--as-muted-fg)]">
              {labels?.noResults ?? 'No matching tools'}
            </p>
          ) : (
            filtered.map((tool) => {
              const open = openOverrides[tool.name] ?? defaultOpen
              const regionId = `${uid}-${tool.name}`
              const toggle = () =>
                setOpenOverrides((current) => ({ ...current, [tool.name]: !open }))
              return (
                <div
                  key={tool.name}
                  role="listitem"
                  data-as="chat-tools-catalog-entry"
                  data-open={open || undefined}
                  className="rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] text-xs"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={regionId}
                    onClick={toggle}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
                  >
                    <Icon className="size-3.5 shrink-0 text-[var(--as-muted-fg)]" aria-hidden />
                    <span className="min-w-0 flex-1 break-words">
                      <span className="font-mono font-medium text-[var(--as-fg)]">{tool.name}</span>
                      {tool.title ? (
                        <span className="ml-1.5 text-[var(--as-muted-fg)]">{tool.title}</span>
                      ) : null}
                    </span>
                    {tool.scope ? (
                      <span
                        title={tool.scope}
                        className="max-w-[40%] shrink-0 truncate rounded-full bg-[var(--as-surface-raised)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--as-muted-fg)]"
                      >
                        {tool.scope}
                      </span>
                    ) : null}
                    <ChevronDown
                      className={cn(
                        'size-3.5 shrink-0 text-[var(--as-muted-fg)] transition-transform',
                        open && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </button>
                  {open ? (
                    <div id={regionId} className="flex flex-col gap-2 border-t border-[var(--as-border)] px-2.5 py-2">
                      {tool.description ? (
                        <p className="text-[var(--as-fg)]">{tool.description}</p>
                      ) : null}
                      {tool.arguments && tool.arguments.length > 0 ? (
                        <div>
                          <p className="mb-1 font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                            {labels?.arguments ?? 'Arguments'}
                          </p>
                          <ul className="flex flex-col gap-1.5">
                            {tool.arguments.map((argument) => (
                              <li
                                key={argument.name}
                                className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] px-2 py-1.5"
                              >
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="font-mono font-medium text-[var(--as-fg)]">
                                    {argument.name}
                                  </span>
                                  {argument.type ? (
                                    <span className="rounded-full border border-[var(--as-border)] bg-[var(--as-surface)] px-1.5 py-px font-mono text-[10px] leading-4 text-[var(--as-muted-fg)]">
                                      {argument.type}
                                    </span>
                                  ) : null}
                                  <span
                                    className={cn(
                                      'text-[10px] font-medium uppercase tracking-wide',
                                      argument.required
                                        ? 'text-[var(--as-warning)]'
                                        : 'text-[var(--as-muted-fg)]',
                                    )}
                                  >
                                    {argument.required
                                      ? (labels?.required ?? 'required')
                                      : (labels?.optional ?? 'optional')}
                                  </span>
                                </div>
                                {argument.description ? (
                                  <p className="mt-0.5 leading-snug text-[var(--as-muted-fg)]">
                                    {argument.description}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {tool.example ? (
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-[var(--as-radius-sm)] bg-[var(--as-surface-raised)] p-2 font-mono text-[11px] leading-relaxed">
                          {tool.example}
                        </pre>
                      ) : null}
                      {tool.response ? (
                        <div>
                          <p className="mb-1 font-medium uppercase tracking-wide text-[var(--as-muted-fg)]">
                            {labels?.response ?? 'Response'}
                          </p>
                          <p className="text-[var(--as-fg)]">{tool.response}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  },
)
