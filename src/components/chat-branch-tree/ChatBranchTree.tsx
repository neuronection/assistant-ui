import * as React from 'react'
import { GitFork, MessageSquare, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { activePathSet, type BranchTree } from '../chat-core/tree'

export interface ChatBranchTreeIcons {
  user: LucideIcon
  assistant: LucideIcon
  fork: LucideIcon
}

export interface ChatBranchTreeLabels {
  tree: string
  user: string
  assistant: string
  forked: (count: number) => string
}

export interface ChatBranchTreeNode {
  id: string
  role: 'user' | 'assistant' | 'system'
  excerpt?: string
  parentId: string | null
  activeChildId: string | null
  childIds: string[]
}

export interface ChatBranchTreeProps {
  /** From `buildBranchTree` / `linearTree` (chat-core). */
  tree: BranchTree
  /** Override the pointer-walk active set (e.g. while a select is pending). */
  activeIds?: Set<string>
  /** Click = flip one pointer (family `select` endpoint, level-flip semantics). */
  onSelect?: (nodeId: string) => void
  maxExcerpt?: number
  icons?: Partial<ChatBranchTreeIcons>
  labels?: Partial<ChatBranchTreeLabels>
  className?: string
}

function excerptOf(excerpt: string | undefined, max: number): string {
  if (excerpt === undefined) {
    return ''
  }
  const clean = excerpt.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

/**
 * The OpenWebUI-style conversation tree rail (study's `BranchTreePanel`,
 * family branching contract): recursive commit-graph rows — filled dots on
 * the active path, hollow dots for hidden variants, fork badges, excerpts.
 * `role="tree"` with roving-tabindex keyboard navigation.
 */
export const ChatBranchTree = React.forwardRef<HTMLDivElement, ChatBranchTreeProps>(
  function ChatBranchTree({ tree, activeIds, onSelect, maxExcerpt = 100, icons, labels, className }, ref) {
    const active = React.useMemo(() => activeIds ?? activePathSet(tree), [activeIds, tree])
    const UserIcon = icons?.user ?? MessageSquare
    const AssistantIcon = icons?.assistant ?? Sparkles
    const ForkIcon = icons?.fork ?? GitFork
    const rootIds = React.useMemo(
      () => Object.values(tree.nodes).filter((node) => node.parentId === null).map((node) => node.id),
      [tree],
    )
    const nodeIds = React.useMemo(() => Object.keys(tree.nodes), [tree])
    const [tabStopId, setTabStopId] = React.useState<string | null>(null)
    const effectiveTabStop = tabStopId !== null && nodeIds.includes(tabStopId) ? tabStopId : nodeIds[0]

    const focusNode = (id: string) => {
      setTabStopId(id)
      document.querySelector<HTMLElement>(`[data-tree-node="${id}"]`)?.focus()
    }

    const onKeyDown = (event: React.KeyboardEvent, id: string) => {
      const index = nodeIds.indexOf(id)
      if (event.key === 'ArrowDown' && index < nodeIds.length - 1) {
        event.preventDefault()
        focusNode(nodeIds[index + 1]!)
      } else if (event.key === 'ArrowUp' && index > 0) {
        event.preventDefault()
        focusNode(nodeIds[index - 1]!)
      } else if (event.key === 'Home' && nodeIds.length > 0) {
        event.preventDefault()
        focusNode(nodeIds[0]!)
      } else if (event.key === 'End' && nodeIds.length > 0) {
        event.preventDefault()
        focusNode(nodeIds[nodeIds.length - 1]!)
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect?.(id)
      }
    }

    const renderNode = (id: string, depth: number): React.ReactNode => {
      const node = tree.nodes[id]
      if (node === undefined) {
        return null
      }
      const onPath = active.has(id)
      const RoleIcon = node.role === 'user' ? UserIcon : AssistantIcon
      const childCount = node.childIds.length
      return (
        <div key={id} role="none">
          <div
            role="treeitem"
            aria-selected={onPath}
            aria-level={depth + 1}
            tabIndex={id === effectiveTabStop ? 0 : -1}
            data-tree-node={id}
            data-on-path={onPath}
            onKeyDown={(event) => onKeyDown(event, id)}
            onClick={() => onSelect?.(id)}
            className={cn(
              'flex min-h-7 cursor-pointer select-none items-center gap-2 rounded-[var(--as-radius-sm)] px-1.5 py-1 text-xs transition-colors hover:bg-[var(--as-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
              onPath ? 'text-[var(--as-fg)]' : 'text-[var(--as-muted-fg)]',
            )}
            style={{ paddingInlineStart: depth * 14 + 6 }}
          >
            <span
              aria-hidden
              className={cn(
                'size-2 shrink-0 rounded-full border',
                onPath
                  ? 'border-[var(--as-primary)] bg-[var(--as-primary)]'
                  : 'border-[var(--as-border)] bg-transparent',
              )}
            />
            <RoleIcon className="size-3.5 shrink-0" aria-hidden />
            <span className={cn('min-w-0 flex-1 truncate', onPath && 'font-medium')}>
              {excerptOf(node.excerpt, maxExcerpt)}
            </span>
            {childCount > 1 ? (
              <span
                className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--as-surface-raised)] px-1.5 py-0.5 text-[10px] text-[var(--as-muted-fg)]"
                title={labels?.forked?.(childCount) ?? `${childCount} variants`}
              >
                <ForkIcon className="size-3" aria-hidden />
                {childCount}
              </span>
            ) : null}
          </div>
          {childCount > 0 ? (
            <div role="group" className="relative">
              <span
                aria-hidden
                className="absolute top-0 bottom-0 w-px bg-[var(--as-border)]"
                style={{ insetInlineStart: depth * 14 + 12 }}
              />
              {node.childIds.map((childId) => renderNode(childId, depth + 1))}
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="tree"
        aria-label={labels?.tree ?? 'Conversation branches'}
        data-as="chat-branch-tree"
        className={cn('flex max-h-96 flex-col overflow-y-auto p-1 text-xs', className)}
      >
        {rootIds.length === 0 ? (
          <p className="px-2 py-3 text-[var(--as-muted-fg)]">{labels?.tree ?? 'No messages yet'}</p>
        ) : (
          rootIds.map((id) => renderNode(id, 0))
        )}
      </div>
    )
  },
)
