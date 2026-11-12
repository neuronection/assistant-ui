import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FamilyMenu } from '../src/components/family-menu/FamilyMenu'

afterEach(() => {
  cleanup()
})

describe('FamilyMenu', () => {
  it('renders the trigger with a drawer label', () => {
    render(<FamilyMenu current="career" />)
    expect(
      screen.getByRole('button', { name: 'Explore projects' }),
    ).toBeInTheDocument()
  })

  it('opens the family list with descriptions and the current marker', async () => {
    const user = userEvent.setup()
    render(<FamilyMenu current="career" version="0.16.0" />)
    const trigger = screen.getByRole('button', { name: 'Explore projects' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog', {
      name: 'Neuronection family',
    })
    expect(within(dialog).getByText('Health Assistant')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Records and lab insights, kept on your machine.'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Current')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('link', { name: 'Career Assistant (Current)' }),
    ).toHaveAttribute('href', 'https://neuronection.com/en/career/')
    expect(within(dialog).getByText('4 apps')).toBeInTheDocument()
    expect(within(dialog).getByText('0.16.0')).toBeInTheDocument()
  })

  it('closes from the close button and keeps focus returning to the trigger', async () => {
    const user = userEvent.setup()
    render(<FamilyMenu current="study" />)
    const trigger = screen.getByRole('button', { name: 'Explore projects' })
    await user.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('opens with the keyboard and closes on Escape, restoring focus', async () => {
    const user = userEvent.setup()
    render(<FamilyMenu current="health" />)
    const trigger = screen.getByRole('button', { name: 'Explore projects' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('reports open changes', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<FamilyMenu current="desktop" onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Explore projects' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('renders custom projects', async () => {
    const user = userEvent.setup()
    render(
      <FamilyMenu
        current="career"
        projects={[
          {
            id: 'world',
            name: 'World Knowledge',
            description: 'Structured knowledge packs.',
            href: 'https://example.com',
            current: true,
          },
        ]}
        countLabel={() => null}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Explore projects' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('World Knowledge')).toBeInTheDocument()
    expect(within(dialog).getByText('Current')).toBeInTheDocument()
    expect(within(dialog).queryByText('4 apps')).not.toBeInTheDocument()
  })

  it('open panel has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<FamilyMenu current="career" version="0.16.0" />)
    await user.click(screen.getByRole('button', { name: 'Explore projects' }))
    await screen.findByRole('dialog')
    expect(
      await axe(container, {
        rules: { region: { enabled: false } },
      }),
    ).toHaveNoViolations()
  })
})
