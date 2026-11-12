import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ShortcutList, type ShortcutGroup } from '../src/components/shortcut-list'

const groups: ShortcutGroup[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    entries: [
      { id: 'palette', label: 'Command palette', keys: 'Ctrl K' },
      { id: 'search', label: 'Search', keys: 'Ctrl F' },
    ],
  },
  {
    id: 'editing',
    label: 'Editing',
    entries: [
      { id: 'save', label: 'Save note', keys: 'Ctrl S' },
      { id: 'format', label: 'Format', keys: 'Ctrl B', disabled: true },
    ],
  },
]

describe('ShortcutList', () => {
  it('renders grouped headings, labels and keycaps', () => {
    render(<ShortcutList groups={groups} />)
    expect(screen.getByRole('heading', { name: 'Navigation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editing' })).toBeInTheDocument()
    expect(screen.getByText('Command palette')).toBeInTheDocument()
    expect(screen.getByText('Ctrl K').tagName).toBe('KBD')
    expect(screen.getByText('Ctrl S').tagName).toBe('KBD')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getAllByRole('list')[0]).toHaveClass('m-0', 'list-none', 'p-0')
  })

  it('omits empty groups', () => {
    render(
      <ShortcutList
        groups={[...groups, { id: 'empty', label: 'Empty group', entries: [] }]}
      />,
    )
    expect(screen.queryByRole('heading', { name: 'Empty group' })).not.toBeInTheDocument()
  })

  it('marks disabled entries without removing them', () => {
    render(<ShortcutList groups={groups} />)
    const disabled = screen.getByText('Format').closest('li')
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
    expect(disabled).toHaveAttribute('data-disabled', 'true')
    expect(screen.getByText('Ctrl B')).toBeInTheDocument()
  })

  it('merges className on the root', () => {
    const { container } = render(<ShortcutList groups={groups} className="mt-4" />)
    const root = container.querySelector('[data-as="shortcut-list"]')
    expect(root).toHaveClass('mt-4')
  })

  it('has no axe violations', async () => {
    const { container } = render(<ShortcutList groups={groups} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
