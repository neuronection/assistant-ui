/**
 * Hierarchy (dagre) layout helpers for the concept graph.
 *
 * In a hierarchical layout, nodes are arranged top-to-bottom based on edge
 * relationships. Different relation types have different semantic
 * directions:
 *
 * - **Normal** (source above target): the actor/influencer ranks higher.
 *
 * - **Reversed** (target above source): container/group relations — the
 *   container ranks above the member ("x MEMBER_OF y" → y above x).
 *
 * The default reversed set covers the health-assistant vocabulary the
 * module was promoted from; consumers with their own semantics pass a
 * `hierarchyReversedRelations` list (career: `is_a`, `part_of`).
 */

export const DEFAULT_HIERARCHY_REVERSED_RELATIONS: readonly string[] = [
  'MEMBER_OF',
  'PART_OF',
  'LOCATED_IN',
  'CLASSIFIED_AS',
  'HAS_SPECIALTY',
]

/**
 * Given an edge's source, target, and relation type, returns the
 * `{ from, to }` direction to feed into dagre so the hierarchy respects
 * the semantic flow of each relation type.
 */
export function getHierarchyEdgeDirection(
  source: string,
  target: string,
  relation: string,
  reversedRelations: readonly string[] = DEFAULT_HIERARCHY_REVERSED_RELATIONS,
): { from: string; to: string } {
  if (reversedRelations.includes(relation)) {
    return { from: target, to: source }
  }
  return { from: source, to: target }
}
