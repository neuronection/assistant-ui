import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Stepper, Wizard, type WizardStep } from '../src/components/wizard/Wizard'
import { Bot, FolderCog, PartyPopper } from 'lucide-react'

const steps: WizardStep[] = [
  { id: 'intro', title: 'Welcome', subtitle: 'Getting started', icon: FolderCog },
  { id: 'provider', title: 'Connect a provider', subtitle: 'Bring your own AI', icon: Bot },
  { id: 'done', title: 'All set', subtitle: 'Finish setup', icon: PartyPopper, hideFooter: true },
]

function WizardDemo(props: Partial<React.ComponentProps<typeof Wizard>>) {
  const [open, setOpen] = React.useState(true)
  const [step, setStep] = React.useState(0)
  const { onStepChange, ...rest } = props
  return (
    <Wizard
      open={open}
      onOpenChange={setOpen}
      onStepChange={(index) => {
        setStep(index)
        onStepChange?.(index)
      }}
      title="Set up study-assistant"
      steps={steps}
      step={step}
      renderStep={(ctx) => (
        <p>
          {`${ctx.id}:${ctx.index}:${ctx.isFirst ? 'first' : 'mid'}:${ctx.isLast ? 'last' : 'notlast'}`}
        </p>
      )}
      {...rest}
    />
  )
}

describe('Wizard', () => {
  it('renders first step content, header and dots', async () => {
    render(<WizardDemo />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Set up study-assistant')).toBeInTheDocument()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('intro:0:first:notlast')).toBeInTheDocument()
    expect(screen.getByText('Getting started')).toBeInTheDocument()
  })

  it('advances with Next and returns with Back (keyboard)', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<WizardDemo onStepChange={onStepChange} />)
    await screen.findByRole('dialog')
    const next = screen.getByRole('button', { name: 'Get started' })
    next.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByText('provider:1:mid:notlast')).toBeInTheDocument()
    const back = screen.getByRole('button', { name: 'Back' })
    back.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByText('intro:0:first:notlast')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('hides the footer on the last step and lets steps drive completion', async () => {
    render(<WizardDemo initialStep={2} step={undefined} />)
    expect(await screen.findByText('done:2:mid:last')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument()
  })

  it('canContinue=false disables Next', async () => {
    render(
      <WizardDemo
        steps={[
          { id: 'a', title: 'A', canContinue: false },
          { id: 'b', title: 'B' },
        ]}
      />,
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Get started' })).toBeDisabled()
  })

  it('Skip and close call onSkip', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<WizardDemo onSkip={onSkip} />)
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onSkip).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onSkip).toHaveBeenCalledTimes(2)
  })

  it('Escape closes (keyboard)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<WizardDemo onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders the drawer variant', async () => {
    render(<WizardDemo variant="drawer" />)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('data-as', 'wizard')
    expect(dialog.className).toContain('as-anim-drawer')
  })

  it('exposes goTo through the render context', async () => {
    const user = userEvent.setup()
    render(
      <WizardDemo
        steps={[
          { id: 'a', title: 'A' },
          { id: 'b', title: 'B' },
          { id: 'c', title: 'C' },
        ]}
        renderStep={(ctx) => (
          <button type="button" onClick={() => ctx.goTo(2)}>
            jump
          </button>
        )}
      />,
    )
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'jump' }))
    expect(await screen.findByText('C')).toBeInTheDocument()
  })

  it('open state has no axe violations', async () => {
    const { container } = render(<WizardDemo />)
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Stepper', () => {
  it('labels variant marks the current step and supports jump clicks', async () => {
    const user = userEvent.setup()
    const onStepClick = vi.fn()
    render(
      <Stepper
        steps={[
          { id: 'a', label: 'Basics' },
          { id: 'b', label: 'Provider' },
          { id: 'c', label: 'Files' },
        ]}
        current={1}
        variant="labels"
        onStepClick={onStepClick}
      />,
    )
    const current = screen.getByRole('button', { name: 'Provider' })
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Basics' }))
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('dots variant renders a screen-reader summary', () => {
    render(
      <Stepper
        steps={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]}
        current={2}
        variant="dots"
      />,
    )
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Stepper steps={[{ id: 'a', label: 'A' }]} current={0} variant="labels" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
