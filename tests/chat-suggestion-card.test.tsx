import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CalendarRange } from 'lucide-react'

import { ChatSuggestionCard } from '../src/components/chat-suggestion-card'

describe('ChatSuggestionCard', () => {
  it('renders icon, title and hint', () => {
    render(
      <ChatSuggestionCard icon={CalendarRange} hint="5 min">
        Plan my revision
      </ChatSuggestionCard>,
    )
    expect(screen.getByRole('button', { name: /Plan my revision/ })).toBeInTheDocument()
    expect(screen.getByText('5 min')).toBeInTheDocument()
  })

  it('fires onClick from keyboard (Enter)', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ChatSuggestionCard onClick={onClick}>Quiz me</ChatSuggestionCard>)
    const button = screen.getByRole('button', { name: /Quiz me/ })
    button.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('passes axe', async () => {
    const { container } = render(
      <ChatSuggestionCard icon={CalendarRange} hint="5 min">
        Plan my revision
      </ChatSuggestionCard>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
