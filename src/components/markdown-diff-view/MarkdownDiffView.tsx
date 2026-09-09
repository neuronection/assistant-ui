import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react'

import { cn } from '../../lib/utils'
import { MarkdownSurface } from '../chat-markdown'
import { computeUnitDiff, type DiffRow } from '../text-diff-view/lineDiff'

import { splitMarkdownBlocks } from './blockSplit'

export interface MarkdownDiffViewLabels {
  original?: string
  suggested?: string
  /** Fold summary for a run of hidden unchanged blocks. */
  unchangedBlocks?: (count: number) => string
  showLess?: string
  prevChange?: string
  nextChange?: string
  changePosition?: (index: number, total: number) => string
  noChanges?: string
}

const DEFAULT_LABELS: Required<MarkdownDiffViewLabels> = {
  original: 'Original',
  suggested: 'Suggested',
  unchangedBlocks: (count) =>
    count === 1 ? '1 unchanged block' : `${count} unchanged blocks`,
  showLess: 'Show less',
  prevChange: 'Previous change',
  nextChange: 'Next change',
  changePosition: (index, total) => `${index}/${total}`,
  noChanges: 'No changes',
}

export interface MarkdownDiffViewProps {
  original: string
  suggested: string
  /** Unchanged blocks kept visible around each change; the rest fold. Default 1. */
  contextBlocks?: number
  showHeader?: boolean
  showNav?: boolean
  labels?: Partial<MarkdownDiffViewLabels>
  /** Applied to the outer box. */
  className?: string
  /** Applied to the scrolling body — size the view here (e.g. `max-h-80`). */
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

function BlockSurface({ value }: { value: string }) {
  return <MarkdownSurface value={value} className="min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
}

export const MarkdownDiffView = React.forwardRef<
  HTMLDivElement,
  MarkdownDiffViewProps
>(function MarkdownDiffView(
  {
    original,
    suggested,
    contextBlocks = 1,
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
  const rowRefs = useRef(new Map<number, HTMLDivElement>())

  const diff = useMemo(
    () =>
      computeUnitDiff(splitMarkdownBlocks(original), splitMarkdownBlocks(suggested), {
        contextUnits: contextBlocks,
      }),
    [original, suggested, contextBlocks],
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
    if (target === undefined) {
      return
    }
    const element = rowRefs.current.get(target)
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'center' })
    }
  }, [activeGroup, changeGroups])

  if (diff.added === 0 && diff.removed === 0) {
    return (
      <div
        ref={ref}
        data-as="markdown-diff-view"
        className={cn(
          'text-[var(--as-muted-fg)] border-[var(--as-border)] bg-[var(--as-subtle)] rounded-md border p-3 text-xs',
          className,
        )}
      >
        {mergedLabels.noChanges}
      </div>
    )
  }

  const activeGroupStart = changeGroups[activeGroup]
  const activeGroupEnd =
    activeGroupStart === undefined
      ? undefined
      : (() => {
          for (
            let index = activeGroupStart + 1;
            index < flatRows.length;
            index += 1
          ) {
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
          {mergedLabels.unchangedBlocks(row.count)}
        </button>
      )
    }
    const changed = isChangedRow(row)
    const active =
      activeGroupStart !== undefined &&
      activeGroupEnd !== undefined &&
      index >= activeGroupStart &&
      index < activeGroupEnd
    if (!changed) {
      const text = row.left?.text ?? row.right?.text ?? ''
      return (
        <div
          key={entry.key}
          ref={(node) => {
            if (node) {
              rowRefs.current.set(index, node)
            } else {
              rowRefs.current.delete(index)
            }
          }}
          data-context=""
          className={cn('border-[var(--as-border)] px-3 py-1.5', active && 'bg-[var(--as-primary)]/5')}
        >
          <BlockSurface value={text} />
        </div>
      )
    }
    return (
      <div
        key={entry.key}
        ref={(node) => {
          if (node) {
            rowRefs.current.set(index, node)
          } else {
            rowRefs.current.delete(index)
          }
        }}
        className={cn('grid grid-cols-2', active && 'bg-[var(--as-primary)]/5')}
        data-changed={changed || undefined}
        data-active={active || undefined}
      >
        {(['left', 'right'] as const).map((side) => {
          const cell = row[side]
          const isAdd = cell?.kind === 'add'
          const isDel = cell?.kind === 'del'
          return (
            <div
              key={side}
              data-kind={isAdd ? 'add' : isDel ? 'del' : undefined}
              className={cn(
                'min-w-0 px-3 py-1.5',
                isAdd && 'bg-[var(--as-success)]/10',
                isDel && 'bg-[var(--as-danger)]/10',
                cell === null && 'bg-[var(--as-subtle)]/50',
              )}
            >
              {cell === null ? null : <BlockSurface value={cell.text} />}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-as="markdown-diff-view"
      className={cn(
        'bg-[var(--as-surface)] border-[var(--as-border)] flex flex-col overflow-hidden rounded-md border text-sm leading-relaxed',
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
        {flatRows.map((entry, index) => renderRow(entry, index))}
      </div>
    </div>
  )
})
