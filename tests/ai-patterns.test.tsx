import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Wand2 } from 'lucide-react'
import { AiButton } from '../src/components/ai-button/AiButton'
import {
  AiActionsDropdown,
  type AiAction,
} from '../src/components/ai-actions-dropdown/AiActionsDropdown'

function AiButtonDemo(props: Partial<React.ComponentProps<typeof AiButton>>) {
  const [answer, setAnswer] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  return (
    <AiButton
      suggestions={['Why this match?', 'Downsides?']}
      loading={loading}
      onResponse={answer ? <p>{answer}</p> : null}
      onSubmit={(prompt) => {
        setLoading(true)
        setAnswer(`echo: ${prompt}`)
        setLoading(false)
      }}
      {...props}
    />
  )
}

describe('AiButton', () => {
  it('opens on click and submits a suggestion chip', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AiButton suggestions={['Why me?']} onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    await user.click(screen.getByRole('button', { name: 'Why me?' }))
    expect(onSubmit).toHaveBeenCalledWith('Why me?')
  })

  it('submits a typed prompt via the send button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AiButton onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    await user.type(screen.getByLabelText('Ask a question'), 'What fits?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledWith('What fits?')
  })

  it('submits a typed prompt with Enter and clears the input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AiButtonDemo onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    const input = screen.getByLabelText('Ask a question')
    await user.type(input, 'hi{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('hi')
    expect(input).toHaveValue('')
  })

  it('shows loading and error states', async () => {
    render(<AiButtonDemo loading loadingLabel="Thinking…" />)
    await userEvent.click(screen.getByRole('button', { name: 'Ask AI' }))
    expect(screen.getByRole('status')).toHaveTextContent('Thinking…')
  })

  it('supports controlled open (close only on success)', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <AiButton
          open={open}
          onOpenChange={setOpen}
          onSubmit={() => setOpen(false)}
          error={undefined}
        />
      )
    }
    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    const panel = screen.getByRole('dialog')
    expect(panel).toBeInTheDocument()
    await user.type(screen.getByLabelText('Ask a question'), 'x{Enter}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders icon-only when showLabel is false', () => {
    render(<AiButton onSubmit={vi.fn()} showLabel={false} />)
    const trigger = screen.getByRole('button', { name: 'Ask AI' })
    expect(trigger.textContent).toBe('')
  })

  it('closes the panel after submit when closeOnSubmit is set', async () => {
    const user = userEvent.setup()
    render(<AiButtonDemo closeOnSubmit />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    await user.type(screen.getByLabelText('Ask a question'), 'fill it{Enter}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has no axe violations open', async () => {
    const user = userEvent.setup()
    render(<AiButtonDemo error="API offline" />)
    await user.click(screen.getByRole('button', { name: 'Ask AI' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

const actions: AiAction[] = [
  { id: 'summarize', label: 'Summarize', description: 'Short overview', icon: Wand2 },
  { id: 'translate', label: 'Translate', icon: Wand2 },
]

describe('AiActionsDropdown', () => {
  it('opens on click, lists actions, and reports the chosen action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <AiActionsDropdown actions={actions} onAction={onAction} title="AI tools" />,
    )
    await user.click(screen.getByRole('button', { name: 'AI actions' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Short overview')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Summarize/ }))
    expect(onAction).toHaveBeenCalledWith(actions[0])
  })

  it('supports a custom prompt', async () => {
    const user = userEvent.setup()
    const onPrompt = vi.fn()
    render(<AiActionsDropdown actions={actions} onAction={vi.fn()} onPrompt={onPrompt} />)
    await user.click(screen.getByRole('button', { name: 'AI actions' }))
    await user.type(screen.getByLabelText('Ask something custom'), 'custom ask')
    await user.keyboard('{Enter}')
    expect(onPrompt).toHaveBeenCalledWith('custom ask')
  })

  it('Escape closes the menu (keyboard)', async () => {
    const user = userEvent.setup()
    render(<AiActionsDropdown actions={actions} onAction={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'AI actions' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('disables the trigger while busy', () => {
    render(<AiActionsDropdown actions={actions} onAction={vi.fn()} busy />)
    expect(screen.getByRole('button', { name: 'AI actions' })).toBeDisabled()
  })

  it('has no axe violations open', async () => {
    const user = userEvent.setup()
    render(
      <AiActionsDropdown actions={actions} onAction={vi.fn()} title="AI tools" />,
    )
    await user.click(screen.getByRole('button', { name: 'AI actions' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('split mode runs the primary action from the main segment', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <AiActionsDropdown
        actions={actions}
        onAction={onAction}
        primaryAction={actions[0]}
        title="AI tools"
      />,
    )
    await user.click(
      screen.getByRole('button', { name: 'Summarize' }),
    )
    expect(onAction).toHaveBeenCalledWith(actions[0])
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('split mode opens the panel from the chevron without the primary action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <AiActionsDropdown
        actions={actions}
        onAction={onAction}
        primaryAction={actions[0]}
        title="AI tools"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'More AI actions' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Translate/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /Summarize/ }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Translate/ }))
    expect(onAction).toHaveBeenCalledWith(actions[1])
  })

  it('split mode closes the panel with Escape (keyboard)', async () => {
    const user = userEvent.setup()
    render(
      <AiActionsDropdown
        actions={actions}
        onAction={vi.fn()}
        primaryAction={actions[0]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'More AI actions' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('split mode disables both segments while busy', () => {
    render(
      <AiActionsDropdown
        actions={actions}
        onAction={vi.fn()}
        primaryAction={actions[0]}
        busy
        title="AI tools"
      />,
    )
    expect(screen.getByRole('button', { name: 'Summarize' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'More AI actions' })).toBeDisabled()
  })

  it('split mode has no axe violations open', async () => {
    const user = userEvent.setup()
    render(
      <AiActionsDropdown
        actions={actions}
        onAction={vi.fn()}
        primaryAction={actions[0]}
        title="AI tools"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'More AI actions' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
