import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Clock } from 'lucide-react'

import { ChatHistoryButton } from '../src/components/chat-history-button'

describe('ChatHistoryButton', () => {
  it('renders a labelled popover trigger with the default icon', () => {
    render(<ChatHistoryButton>{() => <p>Sessions</p>}</ChatHistoryButton>)
    expect(screen.getByRole('button', { name: 'Chat history' })).toBeInTheDocument()
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument()
  })

  it('opens the panel, calls onOpen, and closes via the close callback', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    let closeRef: (() => void) | null = null
    render(
      <ChatHistoryButton onOpen={onOpen}>
        {(close) => {
          closeRef = close
          return <p>Sessions</p>
        }}
      </ChatHistoryButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Chat history' }))
    expect(await screen.findByText('Sessions')).toBeInTheDocument()
    expect(onOpen).toHaveBeenCalledTimes(1)

    closeRef!()
    await waitFor(() => {
      expect(screen.queryByText('Sessions')).not.toBeInTheDocument()
    })
  })

  it('supports an icon override and label override', async () => {
    const user = userEvent.setup()
    render(
      <ChatHistoryButton icon={Clock} labels={{ open: 'Verlauf' }}>
        {() => <p>Sitzungen</p>}
      </ChatHistoryButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Verlauf' }))
    expect(await screen.findByText('Sitzungen')).toBeInTheDocument()
  })

  it('passes axe while open', async () => {
    const user = userEvent.setup()
    const { container } = render(<ChatHistoryButton>{() => <p>Sessions</p>}</ChatHistoryButton>)
    expect(await axe(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: 'Chat history' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
