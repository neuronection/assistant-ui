import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SetupAssignments } from '../src/components/setup-assignments/SetupAssignments'

const rows = [
  {
    id: 'chat',
    label: 'Chat default',
    hint: 'now: unset · fills: gpt-5.6-terra',
    checked: true,
    onCheckedChange: vi.fn(),
  },
  {
    id: 'vision',
    label: 'Vision default',
    hint: 'no model selected',
    checked: false,
    disabled: true,
    onCheckedChange: vi.fn(),
  },
]

describe('SetupAssignments', () => {
  it('renders the titled section with its hint and rows', () => {
    render(
      <SetupAssignments
        title="Default assignments"
        hint="Each switch fills that empty default."
        rows={rows}
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Default assignments' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Each switch fills that empty default.'),
    ).toBeInTheDocument()
    for (const row of rows) {
      expect(screen.getByText(row.label)).toBeInTheDocument()
    }
  })

  it('renders each row hint and its switch state', () => {
    render(<SetupAssignments title="Defaults" rows={rows} />)
    expect(
      screen.getByText('now: unset · fills: gpt-5.6-terra'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('no model selected'),
    ).toBeInTheDocument()
    const chat = screen.getByRole('switch', { name: /chat default/i })
    expect(chat).toHaveAttribute('aria-checked', 'true')
    const vision = screen.getByRole('switch', { name: /vision default/i })
    expect(vision).toHaveAttribute('aria-checked', 'false')
    expect(vision).toBeDisabled()
  })

  it('a click reports the flipped value for the right row', async () => {
    const user = userEvent.setup()
    const chatChange = vi.fn()
    render(
      <SetupAssignments
        title="Defaults"
        rows={[
          { id: 'chat', label: 'Chat default', checked: true, onCheckedChange: chatChange },
          { id: 'stt', label: 'Stt default', checked: false, onCheckedChange: vi.fn() },
        ]}
      />,
    )
    await user.click(screen.getByRole('switch', { name: /chat default/i }))
    expect(chatChange).toHaveBeenCalledWith(false)
  })

  it('disabled rows ignore clicks', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <SetupAssignments
        title="Defaults"
        rows={[
          {
            id: 'vision',
            label: 'Vision default',
            hint: 'no model selected',
            checked: false,
            disabled: true,
            onCheckedChange,
          },
        ]}
      />,
    )
    await user.click(screen.getByRole('switch', { name: /vision default/i }))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('omits the hint paragraph and the rows container when empty', () => {
    render(<SetupAssignments title="Defaults" rows={[]} />)
    expect(
      screen.getByRole('heading', { name: 'Defaults' }),
    ).toBeInTheDocument()
    expect(document.querySelector('button[role="switch"]')).toBeNull()
  })

  it('has no accessibility violations in the mixed row state', async () => {
    render(
      <SetupAssignments
        title="Default assignments"
        hint="Each switch fills that empty default with the shown model."
        rows={rows}
      />,
    )
    const section = document.querySelector('section')
    expect(section).not.toBeNull()
    expect(await axe(section!)).toHaveNoViolations()
  })

  it('forwards the ref and spreads extra props', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <SetupAssignments
        ref={ref}
        title="Defaults"
        rows={rows}
        data-testid="x"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.dataset.testid).toBe('x')
  })
})
