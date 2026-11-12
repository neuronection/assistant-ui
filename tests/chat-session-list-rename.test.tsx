import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ChatSessionList } from '../src/components/chat-session-list'

const sessions = [
  { id: 's1', title: 'Calculus revision', updatedAt: Date.now() - 3_600_000 },
  { id: 's2', title: 'Term paper outline', updatedAt: Date.now() - 86_400_000 },
]

describe('ChatSessionList inline rename', () => {
  it('edits the title in place when onRenameCommit is provided', async () => {
    const user = userEvent.setup()
    const onRenameCommit = vi.fn()
    const onRename = vi.fn()
    render(
      <ChatSessionList
        sessions={sessions}
        onSelect={() => {}}
        onRename={onRename}
        onRenameCommit={onRenameCommit}
      />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Rename' })[0]!)
    const input = screen.getByRole('textbox', { name: 'Conversation title' })
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.type(input, 'Calculus — limits focus')
    await user.keyboard('{Enter}')
    expect(onRenameCommit).toHaveBeenCalledWith('s1', 'Calculus — limits focus')
    expect(onRename).not.toHaveBeenCalled()
  })

  it('cancels the inline edit on Escape', async () => {
    const user = userEvent.setup()
    const onRenameCommit = vi.fn()
    render(
      <ChatSessionList sessions={sessions} onSelect={() => {}} onRenameCommit={onRenameCommit} />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Rename' })[0]!)
    await user.keyboard('{Escape}')
    expect(onRenameCommit).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('keeps the dialog flow when only onRename is given', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<ChatSessionList sessions={sessions} onSelect={() => {}} onRename={onRename} />)
    await user.click(screen.getAllByRole('button', { name: 'Rename' })[0]!)
    expect(onRename).toHaveBeenCalledWith('s1')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('passes axe while editing', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ChatSessionList sessions={sessions} onSelect={() => {}} onRenameCommit={() => {}} />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Rename' })[0]!)
    expect(await axe(container)).toHaveNoViolations()
  })
})
