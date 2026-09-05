import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react'

import { cn } from '../../lib/utils'

import { computeLineDiff, type DiffCell, type DiffRow } from './lineDiff'

export interface TextDiffViewLabels {
  original?: string
  suggested?: string
  /** Fold summary for a run of hidden unchanged lines. */
  unchangedLines?: (count: number) => string
  showLess?: string
  prevChange?: string
  nextChange?: string
  changePosition?: (index: number, total: number) => string
}

const DEFAULT_LABELS: Required<TextDiffViewLabels> = {
  original: 'Original',
  suggested: 'Suggested',
  unchangedLines: (count) =>
    count === 1 ? '1 unchanged line' : `${count} unchanged lines`,
  showLess: 'Show less',
  prevChange: 'Previous change',
  nextChange: 'Next change',
  changePosition: (index, total) => `${index}/${total}`,
}

export interface TextDiffViewProps {
  original: string
  suggested: string
  /** Unchanged context lines kept visible around each changed block. Default 2. */
  contextLines?: number
  showHeader?: boolean
  showNav?: boolean
  labels?: Partial<TextDiffViewLabels>
  /** Applied to the outer box. */
  className?: string
  /** Applied to the scrolling body — size the view here (e.g. `max-h-64`). */
  bodyClassName?: string
}

function isChangedRow(row: DiffRow): boolean {
  return (
    row.kind === 'pair' &&
    (row.left?.kind === 'del' || row.right?.kind === 'add')
  )
}

interface FlatRow {
  key: string
  row: DiffRow
  foldOf?: number
  collapseOf?: number
}

function CellContent({ cell }: { cell: DiffCell }) {
  if (cell.segments === undefined) {
    return <span className="whitespace-pre-wrap break-words">{cell.text}</span>
  }
  return (
    <span className="whitespace-pre-wrap break-words">
      {cell.segments.map((segment, index) =>
        segment.changed ? (
          <mark
            key={index}
            className={cn(
              'rounded-[2px] text-inherit',
              cell.kind === 'add' ? 'bg-[var(--as-success)]/30' : 'bg-[var(--as-danger)]/30',
            )}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  )
}

export const TextDiffView = React.forwardRef<HTMLDivElement, TextDiffViewProps>(
  function TextDiffView(
    {
      original,
      suggested,
      contextLines = 2,
      showHeader = true,
      showNav = true,
      labels,
      className,
      bodyClassName,
    },
    ref,
  ) {
    const mergedLabels = { ...DEFAULT_LABELS, ...labels }
    const [expanded, setExpanded] = useState<Set<number>>(new Set())
    const [activeGroup, setActiveGroup] = useState(0)
    const scrollRef = React.useRef<HTMLDivElement | null>(null)
    const diff = useMemo(
      () => computeLineDiff(original, suggested, { contextLines }),
      [original, suggested, contextLines],
    )

    const flatRows = useMemo<FlatRow[]>(() => {
      const out: FlatRow[] = []
      diff.rows.forEach((row, index) => {
        if (row.kind === 'fold' && expanded.has(index)) {
          row.hidden.forEach((hiddenRow, hiddenIndex) => {
            out.push({ key: `${index}.${hiddenIndex}`, row: hiddenRow })
          })
          out.push({ key: `${index}.collapse`, row, collapseOf: index })
        } else {
          out.push({
            key: String(index),
            row,
            foldOf: row.kind === 'fold' ? index : undefined,
          })
        }
      })
      return out
    }, [diff.rows, expanded])

    const changeGroups = useMemo<number[]>(() => {
      const groups: number[] = []
      let inGroup = false
      flatRows.forEach((entry, index) => {
        const changed = isChangedRow(entry.row)
        if (changed && !inGroup) {
          groups.push(index)
        }
        inGroup = changed
      })
      return groups
    }, [flatRows])

    const virtualizer = useVirtualizer({
      count: flatRows.length,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 22,
      overscan: 12,
      getItemKey: (index) => flatRows[index]?.key ?? String(index),
    })

    useEffect(() => {
      setExpanded(new Set())
      setActiveGroup(0)
    }, [original, suggested])

    useEffect(() => {
      if (activeGroup >= changeGroups.length) {
        setActiveGroup(0)
      }
    }, [activeGroup, changeGroups.length])

    useEffect(() => {
      const target = changeGroups[activeGroup]
      if (target !== undefined) {
        virtualizer.scrollToIndex(target, { align: 'center' })
      }
    }, [activeGroup, changeGroups, virtualizer])

    if (diff.added === 0 && diff.removed === 0) {
      return (
        <p
          ref={ref}
          className={cn(
            'text-[var(--as-muted-fg)] border-[var(--as-border)] bg-[var(--as-subtle)] rounded-md border p-3 text-xs',
            className,
          )}
        >
          {'No changes'}
        </p>
      )
    }

    const activeGroupStart = changeGroups[activeGroup]
    const activeGroupEnd =
      activeGroupStart === undefined
        ? undefined
        : (() => {
            for (let index = activeGroupStart + 1; index < flatRows.length; index += 1) {
              const entry = flatRows[index]
              if (entry !== undefined && isChangedRow(entry.row)) {
                return index
              }
            }
            return flatRows.length
          })()

    const renderRow = (entry: FlatRow, index: number) => {
      const row = entry.row
      if (row.kind === 'fold') {
        if (entry.collapseOf !== undefined) {
          const collapseOf = entry.collapseOf
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() =>
                setExpanded((current) => {
                  const next = new Set(current)
                  next.delete(collapseOf)
                  return next
                })
              }
              className="text-[var(--as-muted-fg)] hover:bg-[var(--as-subtle)] hover:text-[var(--as-fg)] flex w-full items-center gap-1 px-3 py-0.5 text-left text-[11px]"
            >
              <ChevronDown className="size-3" aria-hidden />
              {mergedLabels.showLess}
            </button>
          )
        }
        const foldOf = entry.foldOf
        return (
          <button
            key={entry.key}
            type="button"
            onClick={() => {
              if (foldOf !== undefined) {
                setExpanded((current) => {
                  const next = new Set(current)
                  next.add(foldOf)
                  return next
                })
              }
            }}
            className="text-[var(--as-muted-fg)] hover:bg-[var(--as-subtle)] hover:text-[var(--as-fg)] flex w-full items-center gap-1 px-3 py-0.5 text-left text-[11px]"
          >
            <ChevronRight className="size-3" aria-hidden />
            {mergedLabels.unchangedLines(row.count)}
          </button>
        )
      }
      const changed = isChangedRow(row)
      const active =
        activeGroupStart !== undefined &&
        activeGroupEnd !== undefined &&
        index >= activeGroupStart &&
        index < activeGroupEnd
      return (
        <div
          key={entry.key}
          className={cn('grid grid-cols-2', active && 'bg-[var(--as-primary)]/5')}
          data-changed={changed || undefined}
          data-active={active || undefined}
        >
          {(['left', 'right'] as const).map((side) => {
            const cell = row[side]
            const isAdd = cell?.kind === 'add'
            const isDel = cell?.kind === 'del'
            return (
              <pre
                key={side}
                className={cn(
                  'flex min-w-0 gap-1.5 px-2 py-0.5',
                  isAdd && 'bg-[var(--as-success)]/10 text-[var(--as-success)]',
                  isDel && 'bg-[var(--as-danger)]/10 text-[var(--as-danger)]',
                )}
              >
                <span className="w-7 shrink-0 select-none text-right text-[var(--as-muted-fg)] tabular-nums opacity-70">
                  {cell?.no ?? ''}
                </span>
                <span className="w-2 shrink-0 select-none text-center" aria-hidden>
                  {isAdd ? '+' : isDel ? '-' : ''}
                </span>
                <span className="min-w-0 flex-1">
                  {cell === null ? null : <CellContent cell={cell} />}
                </span>
              </pre>
            )
          })}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        data-as="text-diff-view"
        className={cn(
          'bg-[var(--as-subtle)] border-[var(--as-border)] flex flex-col overflow-hidden rounded-md border font-mono text-xs leading-relaxed',
          className,
        )}
      >
        {showHeader ? (
          <div className="border-[var(--as-border)] text-[var(--as-muted-fg)] grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase">
            <span className="flex items-center gap-1">
              <Minus className="size-3 text-[var(--as-danger)]" aria-hidden />
              {mergedLabels.original}
            </span>
            <span className="flex items-center gap-2">
              <span>
                <span className="text-[var(--as-success)]">+{diff.added}</span>{' '}
                <span className="text-[var(--as-danger)]">−{diff.removed}</span>
              </span>
              {showNav && changeGroups.length > 0 ? (
                <span className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label={mergedLabels.prevChange}
                    title={mergedLabels.prevChange}
                    disabled={activeGroup === 0}
                    onClick={() => setActiveGroup((value) => Math.max(0, value - 1))}
                    className="hover:bg-[var(--as-border)] hover:text-[var(--as-fg)] rounded p-0.5 disabled:opacity-40"
                  >
                    <ChevronUp className="size-3.5" aria-hidden />
                  </button>
                  <span className="tabular-nums">
                    {mergedLabels.changePosition(activeGroup + 1, changeGroups.length)}
                  </span>
                  <button
                    type="button"
                    aria-label={mergedLabels.nextChange}
                    title={mergedLabels.nextChange}
                    disabled={activeGroup >= changeGroups.length - 1}
                    onClick={() =>
                      setActiveGroup((value) => Math.min(changeGroups.length - 1, value + 1))
                    }
                    className="hover:bg-[var(--as-border)] hover:text-[var(--as-fg)] rounded p-0.5 disabled:opacity-40"
                  >
                    <ChevronDown className="size-3.5" aria-hidden />
                  </button>
                </span>
              ) : null}
            </span>
            <span className="flex items-center justify-end gap-1">
              {mergedLabels.suggested}
              <Plus className="size-3 text-[var(--as-success)]" aria-hidden />
            </span>
          </div>
        ) : null}
        <div ref={scrollRef} className={cn('min-h-0 flex-1 overflow-y-auto', bodyClassName)}>
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {(() => {
                  const entry = flatRows[virtualItem.index]
                  return entry === undefined ? null : renderRow(entry, virtualItem.index)
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
)
