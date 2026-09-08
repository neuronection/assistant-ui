import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Zap } from 'lucide-react'

import { ChatToolsCatalog, type ChatToolCatalogEntry } from '../src/components/chat-tools-catalog'

const tools: ChatToolCatalogEntry[] = [
  {
    name: 'search_jobs',
    title: 'Searching the job catalog',
    description: 'Full-text search over the job catalog.',
    arguments: [
      { name: 'query', type: 'string', required: true, description: 'What to look for.' },
      { name: 'limit', type: 'integer', required: false, description: 'Max results.' },
    ],
    example: '{"query": "nurse"}',
    response: 'JSON list of job refs.',
    scope: 'read',
  },
  {
    name: 'my_matches',
    description: 'Fit-scored matches for the caller.',
    scope: 'read',
  },
]

const LONG_SCOPE =
  'Read-only — lists the learner’s courses and node resources; also served to external agents via the MCP resource server.'

describe('ChatToolsCatalog', () => {
  it('renders the catalog entries collapsed with name, title and scope', () => {
    render(<ChatToolsCatalog tools={tools} />)
    const list = screen.getByRole('list', { name: 'Tools' })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('search_jobs')).toBeInTheDocument()
    expect(screen.getByText('Searching the job catalog')).toBeInTheDocument()
    expect(screen.getAllByText('read')).toHaveLength(2)
    expect(screen.getByText('my_matches')).toBeInTheDocument()
    expect(screen.queryByText('Full-text search over the job catalog.')).not.toBeInTheDocument()
  })

  it('expands an entry on click and reveals the details', async () => {
    const user = userEvent.setup()
    render(<ChatToolsCatalog tools={tools} />)
    const trigger = screen.getByRole('button', { name: /search_jobs/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Full-text search over the job catalog.')).toBeInTheDocument()
    expect(screen.getByText('Arguments')).toBeInTheDocument()
    expect(screen.getByText('query')).toBeInTheDocument()
    expect(screen.getByText('string')).toBeInTheDocument()
    expect(screen.getByText('integer')).toBeInTheDocument()
    expect(screen.getByText('required')).toBeInTheDocument()
    expect(screen.getByText('optional')).toBeInTheDocument()
    expect(screen.getByText(/What to look for\./)).toBeInTheDocument()
    expect(screen.getByText(/Max results\./)).toBeInTheDocument()
    expect(screen.getByText('{"query": "nurse"}')).toBeInTheDocument()
    expect(screen.getByText('Response')).toBeInTheDocument()
    expect(screen.getByText('JSON list of job refs.')).toBeInTheDocument()
  })

  it('toggles from the keyboard (Enter and Space)', async () => {
    const user = userEvent.setup()
    render(<ChatToolsCatalog tools={tools} />)
    const trigger = screen.getByRole('button', { name: /search_jobs/ })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('starts expanded with defaultOpen', () => {
    render(<ChatToolsCatalog tools={tools} defaultOpen />)
    expect(screen.getByText('Full-text search over the job catalog.')).toBeInTheDocument()
    expect(screen.getByText('Fit-scored matches for the caller.')).toBeInTheDocument()
  })

  it('filters by fuzzy search over name, title and description', async () => {
    const user = userEvent.setup()
    render(<ChatToolsCatalog tools={tools} />)
    const input = screen.getByRole('searchbox', { name: 'Search tools' })
    await user.type(input, 'catalog')
    expect(screen.getByText('search_jobs')).toBeInTheDocument()
    expect(screen.queryByText('my_matches')).not.toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'zzzz')
    expect(screen.getByText('No matching tools')).toBeInTheDocument()
  })

  it('shows the empty state without tools', () => {
    render(<ChatToolsCatalog tools={[]} />)
    expect(screen.getByText('No tools available')).toBeInTheDocument()
  })

  it('caps long scope values with a native tooltip instead of overflowing the header', () => {
    render(
      <ChatToolsCatalog
        tools={[
          {
            name: 'a_very_long_tool_identifier_without_separators_that_must_wrap_not_crop',
            scope: LONG_SCOPE,
          },
        ]}
      />,
    )
    const chip = screen.getByTitle(LONG_SCOPE)
    expect(chip).toHaveTextContent(LONG_SCOPE)
    expect(chip).toHaveClass('truncate')
    expect(chip).toHaveClass('max-w-[40%]')
    const header = screen.getByRole('button', {
      name: /a_very_long_tool_identifier/,
    })
    expect(header).toContainElement(chip)
  })

  it('applies label and icon overrides', async () => {
    const user = userEvent.setup()
    render(
      <ChatToolsCatalog
        tools={tools}
        icon={Zap}
        labels={{ search: 'Werkzeuge suchen', arguments: 'Parameter', required: 'pflicht', optional: 'optionaler' }}
      />,
    )
    expect(screen.getByRole('searchbox', { name: 'Werkzeuge suchen' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /search_jobs/ }))
    expect(screen.getByText('Parameter')).toBeInTheDocument()
    expect(screen.getByText('pflicht')).toBeInTheDocument()
    expect(screen.getByText(/optionaler/)).toBeInTheDocument()
  })

  it('passes axe collapsed, expanded and while filtering', async () => {
    const user = userEvent.setup()
    const { container } = render(<ChatToolsCatalog tools={tools} />)
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: /search_jobs/ }))
    expect(await axe(container)).toHaveNoViolations()
    await user.type(screen.getByRole('searchbox', { name: 'Search tools' }), 'jobs')
    expect(await axe(container)).toHaveNoViolations()
  })
})
