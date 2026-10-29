import { useState } from 'react'
import {
  ConceptGraphView,
  type ConceptGraphEdgeData,
  type ConceptGraphNode,
} from '../src/components/concept-graph'

const nodes: ConceptGraphNode[] = [
  { id: 'ds', name: 'Data Science', primary_kind: 'field', kinds: ['field'] },
  { id: 'ml', name: 'Machine Learning', primary_kind: 'field', kinds: ['field'] },
  { id: 'dl', name: 'Deep Learning', primary_kind: 'field', kinds: ['field'] },
  { id: 'nlp', name: 'NLP', primary_kind: 'field', kinds: ['field'] },
  { id: 'py', name: 'Python', primary_kind: 'tool', kinds: ['tool'] },
  { id: 'torch', name: 'PyTorch', primary_kind: 'tool', kinds: ['tool'] },
  { id: 'stats', name: 'Statistics', primary_kind: 'field', kinds: ['field'] },
]

const edges: ConceptGraphEdgeData[] = [
  { id: 'e1', source: 'ml', target: 'ds', relation: 'IS_A' },
  { id: 'e2', source: 'dl', target: 'ml', relation: 'IS_A' },
  { id: 'e3', source: 'nlp', target: 'ml', relation: 'IS_A' },
  { id: 'e4', source: 'py', target: 'ds', relation: 'RELATED_TO' },
  { id: 'e5', source: 'torch', target: 'dl', relation: 'IS_A' },
  { id: 'e6', source: 'stats', target: 'ds', relation: 'PART_OF' },
]

const kindColors = { field: '#3b82f6', tool: '#10b981' }
const relationColors = { IS_A: '#8b5cf6', RELATED_TO: '#94a3b8', PART_OF: '#f59e0b' }

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: 420, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
    {children}
  </div>
)

export const Force = () => (
  <Frame>
    <ConceptGraphView
      nodes={nodes}
      edges={edges}
      kindColors={kindColors}
      relationColors={relationColors}
    />
  </Frame>
)

export const Hierarchy = () => (
  <Frame>
    <ConceptGraphView
      nodes={nodes}
      edges={edges}
      kindColors={kindColors}
      relationColors={relationColors}
      hierarchyReversedRelations={['IS_A', 'PART_OF']}
    />
  </Frame>
)

export const WithDetailCard = () => {
  const [selected, setSelected] = useState<string | undefined>()
  return (
    <Frame>
      <ConceptGraphView
        nodes={nodes}
        edges={edges}
        kindColors={kindColors}
        relationColors={relationColors}
        selectedNodeId={selected}
        onSelectNode={setSelected}
        onClearSelection={() => setSelected(undefined)}
        renderNodeDetail={({ node, degree, onClose }) => (
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 8,
              minWidth: 160,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            <strong>{node.name}</strong>
            <p style={{ margin: '4px 0', fontSize: 11, color: '#64748b' }}>
              {node.primary_kind} · {degree} relations
            </p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      />
    </Frame>
  )
}

export const Empty = () => (
  <Frame>
    <ConceptGraphView nodes={[]} edges={[]} />
  </Frame>
)
