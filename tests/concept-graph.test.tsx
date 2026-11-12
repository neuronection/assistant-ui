import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import {
  ConceptGraphView,
  DynamicIcon,
  getHierarchyEdgeDirection,
  type ConceptGraphEdgeData,
  type ConceptGraphNode,
} from '../src/components/concept-graph'

const nodes: ConceptGraphNode[] = [
  { id: 'ml', name: 'Machine Learning', primary_kind: 'field', kinds: ['field'] },
  { id: 'dl', name: 'Deep Learning', primary_kind: 'field', kinds: ['field'] },
  { id: 'py', name: 'Python', primary_kind: 'tool', kinds: ['tool'] },
]

const edges: ConceptGraphEdgeData[] = [
  { id: 'e1', source: 'dl', target: 'ml', relation: 'IS_A' },
  { id: 'e2', source: 'py', target: 'ml', relation: 'RELATED_TO' },
]

const kindColors = { field: '#3b82f6', tool: '#10b981' }
const relationColors = { IS_A: '#8b5cf6', RELATED_TO: '#94a3b8' }

function Demo(props: Partial<React.ComponentProps<typeof ConceptGraphView>>) {
  return (
    <div style={{ height: 400 }}>
      <ConceptGraphView
        nodes={nodes}
        edges={edges}
        kindColors={kindColors}
        relationColors={relationColors}
        {...props}
      />
    </div>
  )
}

describe('ConceptGraphView', () => {
  it('renders every node label inside the flow', () => {
    render(<Demo />)
    expect(screen.getByText('Machine Learning')).toBeTruthy()
    expect(screen.getByText('Deep Learning')).toBeTruthy()
    expect(screen.getByText('Python')).toBeTruthy()
  })

  it('defaults to h-full so a height-defined parent sizes the canvas', () => {
    const { container } = render(<Demo />)
    const root = container.querySelector('[data-as="concept-graph"]')
    expect(root?.className).toContain('h-full')
  })

  it('shows the overridden empty-state message when there are no nodes', () => {
    render(
      <Demo nodes={[]} edges={[]} labels={{ empty: 'Nothing to show yet.' }} className="h-[200px]" />,
    )
    expect(screen.getByText('Nothing to show yet.')).toBeTruthy()
  })

  it('toggles between force and hierarchy layouts with accessible buttons', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const force = screen.getByRole('button', { name: 'Force-directed layout' })
    const hierarchy = screen.getByRole('button', { name: 'Hierarchy layout (by relation direction)' })
    expect(force.getAttribute('aria-pressed')).toBe('true')
    await user.click(hierarchy)
    expect(hierarchy.getAttribute('aria-pressed')).toBe('true')
    expect(force.getAttribute('aria-pressed')).toBe('false')
  })

  it('search dims non-matching nodes and Escape clears the term', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const input = screen.getByRole('textbox', { name: 'Find…' })
    await user.type(input, 'python')
    expect(screen.getByText('1')).toBeTruthy()
    await user.type(input, '{Escape}')
    expect(input).toHaveValue('')
  })

  it('reports node selection and exposes the default detail card renderer', async () => {
    // fireEvent, not user-event: ReactFlow's d3-drag pane handler reads
    // event.view.document on mousedown — user-event dispatches without a
    // view and jsdom throws inside the drag listener.
    const onSelect = vi.fn()
    render(
      <Demo
        onSelectNode={onSelect}
        renderNodeDetail={({ node, onClose }) => (
          <div>
            <p>Detail: {node.name}</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      />,
    )
    expect(screen.queryByText('Detail: Machine Learning')).toBeNull()
    fireEvent.click(screen.getByText('Machine Learning'))
    expect(onSelect).toHaveBeenCalledWith('ml')
  })

  it('expands the legend with kind and relation swatches', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Legend' }))
    const legend = screen.getByText('Legend').closest('div')
    expect(within(legend as HTMLElement).getByText('field')).toBeTruthy()
    expect(within(legend as HTMLElement).getByText('IS A')).toBeTruthy()
  })

  it('has no axe violations on the graph surface', async () => {
    const { container } = render(<Demo />)
    expect(
      await axe(container, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('getHierarchyEdgeDirection', () => {
  it('reverses container-style relations by default', () => {
    expect(getHierarchyEdgeDirection('member', 'group', 'MEMBER_OF')).toEqual({
      from: 'group',
      to: 'member',
    })
  })

  it('keeps actor-style relations normal', () => {
    expect(getHierarchyEdgeDirection('actor', 'target', 'TREATS')).toEqual({
      from: 'actor',
      to: 'target',
    })
  })

  it('honors a consumer-provided reversed vocabulary', () => {
    expect(getHierarchyEdgeDirection('child', 'parent', 'is_a', ['is_a'])).toEqual({
      from: 'parent',
      to: 'child',
    })
  })
})

describe('DynamicIcon', () => {
  it('falls back to a placeholder for unknown lucide names', () => {
    const { container } = render(<DynamicIcon icon="definitely-not-an-icon" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('sanitizes custom SVG markup (script stripped)', () => {
    const { container } = render(
      <DynamicIcon
        icon={{
          type: 'custom_svg',
          value: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><script>alert(1)</script></svg>',
        }}
      />,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
