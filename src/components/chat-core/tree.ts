import type { ChatRole } from './types'

export interface BranchNode {
  id: string
  role: ChatRole
  excerpt?: string
  parentId: string | null
  activeChildId: string | null
  /** In insertion (sibling-order) order; the last entry is the newest sibling. */
  childIds: string[]
}

export interface BranchTree {
  activeRootId: string | null
  nodes: Record<string, BranchNode>
}

export type BranchNodeInput = Omit<BranchNode, 'childIds'>

/**
 * Index the server's branch-tree projection (family contract: the read-only
 * `GET …/tree` shape) and compute child lists. Insertion order defines
 * sibling order — the last child is the newest variant (fallback when a
 * parent has no `activeChildId`).
 */
export function buildBranchTree(input: { activeRootId?: string | null; nodes: BranchNodeInput[] }): BranchTree {
  const nodes: Record<string, BranchNode> = {}
  for (const node of input.nodes) {
    nodes[node.id] = { ...node, childIds: [] }
  }
  for (const node of Object.values(nodes)) {
    if (node.parentId !== null && nodes[node.parentId] !== undefined) {
      nodes[node.parentId]!.childIds.push(node.id)
    }
  }
  let activeRootId = input.activeRootId ?? null
  if (activeRootId === null || nodes[activeRootId] === undefined) {
    const roots = Object.values(nodes).filter((node) => node.parentId === null)
    activeRootId = roots.length > 0 ? roots[roots.length - 1]!.id : null
  }
  return { activeRootId, nodes }
}

/**
 * Degenerate single-path tree from a visible (already active-path) message
 * list — for apps/backends without branching yet. Every message parents to
 * the previous one; the tree renders identically to a branched one.
 */
export function linearTree(items: { id: string; role: ChatRole; excerpt?: string }[]): BranchTree {
  const nodes: Record<string, BranchNode> = {}
  let previousId: string | null = null
  for (const item of items) {
    nodes[item.id] = {
      id: item.id,
      role: item.role,
      excerpt: item.excerpt,
      parentId: previousId,
      activeChildId: null,
      childIds: [],
    }
    if (previousId !== null) {
      nodes[previousId]!.activeChildId = item.id
      nodes[previousId]!.childIds.push(item.id)
    }
    previousId = item.id
  }
  return { activeRootId: items.length > 0 ? items[0]!.id : null, nodes }
}

/**
 * The visible conversation: pointer walk from the active root, following
 * each node's `activeChildId` (fallback: newest sibling). Cycle-safe.
 */
export function walkActivePath(tree: BranchTree): string[] {
  const path: string[] = []
  const visited = new Set<string>()
  let currentId = tree.activeRootId
  while (currentId !== null && !visited.has(currentId)) {
    const node = tree.nodes[currentId]
    if (node === undefined) {
      break
    }
    visited.add(currentId)
    path.push(currentId)
    const fallback = node.childIds.length > 0 ? node.childIds[node.childIds.length - 1] ?? null : null
    const nextId = node.activeChildId ?? fallback
    currentId = nextId !== null && tree.nodes[nextId] !== undefined ? nextId : null
  }
  return path
}

export function activePathSet(tree: BranchTree): Set<string> {
  return new Set(walkActivePath(tree))
}

/**
 * Sibling variant info for the inline `‹ n/N ›` switcher: the 1-based index
 * of `nodeId` among its siblings (roots are siblings of each other) and the
 * ordered sibling ids.
 */
export function variantInfo(
  tree: BranchTree,
  nodeId: string,
): { index: number; count: number; siblingIds: string[] } {
  const node = tree.nodes[nodeId]
  if (node === undefined) {
    return { index: 1, count: 1, siblingIds: [nodeId] }
  }
  const siblingIds =
    node.parentId !== null && tree.nodes[node.parentId] !== undefined
      ? tree.nodes[node.parentId]!.childIds
      : Object.values(tree.nodes)
          .filter((candidate) => candidate.parentId === null)
          .map((candidate) => candidate.id)
  const index = siblingIds.indexOf(nodeId)
  return {
    index: index === -1 ? 1 : index + 1,
    count: siblingIds.length,
    siblingIds,
  }
}
