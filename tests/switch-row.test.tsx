import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SwitchRow } from '../src/components/switch-row/SwitchRow'

describe('SwitchRow', () => {
  it('renders a labelled switch with the current-value sub-line', () => {
    render(
      <SwitchRow
        label="Fill default text model"
        currentValue="now: gpt-5.6-terra"
        checked
        onCheckedChange={() => {}}
      />,
    )
    const control = screen.getByRole('switch', { name: /fill default text/i })
    expect(control).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('now: gpt-5.6-terra')).toBeInTheDocument()
  })

  it('click reports the flipped value', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <SwitchRow label="Fill vision" checked={false} onCheckedChange={onCheckedChange} />,
    )
    await user.click(screen.getByRole('switch', { name: /Fill vision/ }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('Enter and Space toggle from the keyboard', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { unmount } = render(
      <SwitchRow label="Fill stt" checked onCheckedChange={onCheckedChange} />,
    )
    await user.tab()
    expect(screen.getByRole('switch', { name: /Fill stt/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenCalledWith(false)
    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledWith(false)
    unmount()
  })

  it('disabled switches are inert and stay axe-clean', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { container } = render(
      <SwitchRow
        label="Fill decision slots"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    )
    const control = screen.getByRole('switch', { name: /Fill decision slots/ })
    expect(control).toBeDisabled()
    await user.click(control)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SwitchRow label="Toggle" checked onCheckedChange={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('hideLabel keeps the name in the accessibility tree, knob only visible', async () => {
    const { container } = render(
      <SwitchRow
        label="Email for matches"
        checked
        hideLabel
        onCheckedChange={() => {}}
      />,
    )
    const control = screen.getByRole('switch', { name: 'Email for matches' })
    expect(control.querySelector('.sr-only')).not.toBeNull()
    expect(control.querySelector('.truncate.font-medium')).toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })
})
