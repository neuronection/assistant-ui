import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Combobox, ComboboxMulti, type ComboboxOption } from '../src/components/combobox/Combobox'

const options: ComboboxOption[] = [
  { value: 'gpt', label: 'GPT-5', description: 'OpenAI', group: 'Cloud' },
  { value: 'claude', label: 'Claude', description: 'Anthropic', group: 'Cloud' },
  { value: 'llama', label: 'Llama 4', description: 'Meta', group: 'Local' },
  { value: 'mistral', label: 'Mistral', description: 'Mistral AI', group: 'Local' },
]

function SingleDemo(props: Partial<React.ComponentProps<typeof Combobox>>) {
  const [value, setValue] = React.useState('')
  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      label="Model"
      {...props}
    />
  )
}

function MultiDemo(props: Partial<React.ComponentProps<typeof ComboboxMulti>>) {
  const [value, setValue] = React.useState<string[]>([])
  return (
    <ComboboxMulti
      options={options}
      value={value}
      onChange={setValue}
      label="Models"
      {...props}
    />
  )
}

describe('Combobox (single)', () => {
  it('opens on click, filters as you type, and selects with Enter (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} value="" onChange={onChange} />)
    await user.click(screen.getByRole('combobox'))
    const search = await screen.findByRole('combobox', { name: 'Search options' })
    await user.type(search, 'llam')
    expect(screen.getByRole('option', { name: /Llama 4/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /GPT-5/ })).not.toBeInTheDocument()
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('llama')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows groups and marks the selected option', async () => {
    const user = userEvent.setup()
    render(<SingleDemo value="claude" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Claude')
    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByRole('option', { name: /Claude/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Local')).toBeInTheDocument()
  })

  it('ArrowDown opens the closed combobox from the trigger (keyboard)', async () => {
    const user = userEvent.setup()
    render(<SingleDemo />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
  })

  it('Escape closes and returns focus (keyboard)', async () => {
    const user = userEvent.setup()
    render(<SingleDemo />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('clearable button empties the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} value="llama" onChange={onChange} clearable />)
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('empty state shows when nothing matches', async () => {
    const user = userEvent.setup()
    render(<SingleDemo />)
    await user.click(screen.getByRole('combobox'))
    const search = await screen.findByRole('combobox', { name: 'Search options' })
    await user.type(search, 'zzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('delegates filtering to onSearchChange in async mode', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(
      <SingleDemo
        options={options.filter((option) => option.value === 'llama')}
        onSearchChange={onSearchChange}
        loading
      />,
    )
    await user.click(screen.getByRole('combobox'))
    const search = await screen.findByRole('combobox', { name: 'Search options' })
    await user.type(search, 'l')
    expect(onSearchChange).toHaveBeenLastCalledWith('l')
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('open state has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<SingleDemo />)
    await user.click(screen.getByRole('combobox'))
    await screen.findByRole('listbox')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ComboboxMulti', () => {
  it('toggles options without closing and updates the trigger summary', async () => {
    const user = userEvent.setup()
    render(<MultiDemo />)
    await user.click(screen.getByRole('combobox'))
    await screen.findByRole('listbox')
    await user.click(screen.getByRole('option', { name: /GPT-5/ }))
    expect(screen.getByRole('option', { name: /GPT-5/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(screen.getByRole('option', { name: /Llama 4/ }))
    expect(screen.getByRole('combobox', { name: 'Models' })).toHaveTextContent(/GPT-5, Llama 4/)
  })

  it('toggles via keyboard without closing the listbox', async () => {
    const user = userEvent.setup()
    render(<MultiDemo />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    const search = await screen.findByRole('combobox', { name: 'Search options' })
    expect(search).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('option', { name: /GPT-5/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('keyboard selection skips disabled options', async () => {
    const user = userEvent.setup()
    render(
      <ComboboxMulti
        options={[
          { value: 'a', label: 'Alpha', disabled: true },
          { value: 'b', label: 'Beta' },
        ]}
        value={[]}
        onChange={() => {}}
      />,
    )
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    const search = await screen.findByRole('combobox', { name: 'Search options' })
    expect(search).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('-opt-1'),
    )
  })

  it('open state has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<MultiDemo />)
    await user.click(screen.getByRole('combobox'))
    await screen.findByRole('listbox')
    expect(await axe(container)).toHaveNoViolations()
  })
})
