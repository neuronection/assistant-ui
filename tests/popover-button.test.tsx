import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { PopoverButton } from '../src/components/popover-button/PopoverButton'
import { InfoButton } from '../src/components/info-button/InfoButton'
import { FieldLabel } from '../src/components/field-label/FieldLabel'
import { Settings } from 'lucide-react'

describe('PopoverButton', () => {
  it('opens on click and closes on Escape (keyboard)', async () => {
    const user = userEvent.setup()
    render(
      <PopoverButton label="Options" trigger={<Settings aria-hidden />}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(await screen.findByText('Panel body')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument()
  })

  it('renders children lazily via render function only when open', async () => {
    const user = userEvent.setup()
    const spy = vi.fn(() => <p>Lazy body</p>)
    render(
      <PopoverButton label="Options" trigger={<span>icon</span>}>
        {spy}
      </PopoverButton>,
    )
    expect(spy).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(await screen.findByText('Lazy body')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
  })

  it('closeSignal increment closes the panel', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <PopoverButton label="Options" trigger={<span>i</span>} closeSignal={0}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    const trigger = screen.getByRole('button', { name: 'Options' })
    await user.click(trigger)
    expect(await screen.findByText('Panel body')).toBeInTheDocument()
    rerender(
      <PopoverButton label="Options" trigger={<span>i</span>} closeSignal={1}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument()
  })

  it('controlled open/onOpenChange works', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <PopoverButton label="Options" trigger={<span>i</span>} open onOpenChange={onOpenChange}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    expect(await screen.findByText('Panel body')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    rerender(
      <PopoverButton label="Options" trigger={<span>i</span>} open={false} onOpenChange={onOpenChange}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument()
  })

  it('open panel has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <PopoverButton label="Options" trigger={<Settings aria-hidden />}>
        <p>Panel body</p>
      </PopoverButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Options' }))
    await screen.findByText('Panel body')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('InfoButton', () => {
  it('exposes content after opening', async () => {
    const user = userEvent.setup()
    render(
      <InfoButton title="What is this?">
        <span>Explains the field</span>
      </InfoButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Information' }))
    expect(await screen.findByText('Explains the field')).toBeInTheDocument()
    expect(screen.getByText('What is this?')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<InfoButton>Details</InfoButton>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FieldLabel', () => {
  it('renders label text with info affordance', async () => {
    const user = userEvent.setup()
    render(
      <FieldLabel info={<span>Helpful text</span>} infoTitle="Hint">
        Display name
      </FieldLabel>,
    )
    expect(screen.getByText('Display name')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Information' }))
    expect(await screen.findByText('Helpful text')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<FieldLabel info="Help">Label</FieldLabel>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
