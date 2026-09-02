import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ChipInput } from '../src/components/chip-input/ChipInput'
import { ChipList } from '../src/components/chip-list/ChipList'

describe('ChipInput', () => {
  it('commits a chip on Enter (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={[]} onChange={onChange} placeholder="Tags" />)
    const input = screen.getByLabelText('Add')
    await user.type(input, 'remote{Enter}')
    expect(onChange).toHaveBeenCalledWith(['remote'])
  })

  it('commits on a separator key', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={[]} onChange={onChange} />)
    await user.type(screen.getByLabelText('Add'), 'react,')
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('removes the last chip with Backspace on an empty input (keyboard)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={['a', 'b']} onChange={onChange} />)
    await user.type(screen.getByLabelText('Add'), '{Backspace}')
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('splits pasted content into chips', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={[]} onChange={onChange} />)
    const input = screen.getByLabelText('Add')
    await user.click(input)
    await user.paste('FBS, Glucose\nHbA1c')
    expect(onChange).toHaveBeenCalledWith(['FBS', 'Glucose', 'HbA1c'])
  })

  it('deduplicates case-insensitively', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={['React']} onChange={onChange} />)
    await user.type(screen.getByLabelText('Add'), 'react{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits the draft on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={[]} onChange={onChange} />)
    await user.type(screen.getByLabelText('Add'), 'draft')
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(['draft'])
  })

  it('removes a chip via its remove button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChipInput value={['remote', 'hybrid']} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Remove remote' }))
    expect(onChange).toHaveBeenCalledWith(['hybrid'])
  })

  it('Tab reaches the remove button and input (keyboard nav)', async () => {
    const { container } = render(<ChipInput value={['chip']} onChange={() => {}} />)
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Remove chip' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByLabelText('Add')).toHaveFocus()
    expect(container.querySelector('[data-as="chip-input"]')).toBeInTheDocument()
  })

  it('renders no add button without addLabel', () => {
    render(<ChipInput value={[]} onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })

  it('commits the draft via the add button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ChipInput value={['one']} onChange={onChange} inputLabel="New item" addLabel="Add" />,
    )
    await user.type(screen.getByRole('textbox', { name: 'New item' }), 'two')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onChange).toHaveBeenCalledWith(['one', 'two'])
  })

  it('keeps the input focused after using the add button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ChipInput value={['one']} onChange={onChange} inputLabel="New item" addLabel="Add" />,
    )
    const input = screen.getByRole('textbox', { name: 'New item' })
    await user.type(input, 'two')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(input).toHaveFocus()
  })

  it('disables the add button while the draft is empty', () => {
    render(<ChipInput value={[]} onChange={() => {}} addLabel="Add" />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('has no axe violations with the add button', async () => {
    const { container } = render(
      <ChipInput value={['one']} onChange={() => {}} inputLabel="New item" addLabel="Add" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ChipInput value={['one', 'two']} onChange={() => {}} placeholder="Tags" addLabel="Add" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChipList', () => {
  it('renders items as pills', () => {
    render(<ChipList items={['a', 'b']} />)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('filters null and undefined entries', () => {
    render(<ChipList items={['a', null, undefined]} />)
    expect(screen.getByText('a')).toBeInTheDocument()
  })

  it('renders emptyText only when provided', () => {
    const { rerender } = render(<ChipList items={[]} emptyText="None yet" />)
    expect(screen.getByText('None yet')).toBeInTheDocument()
    rerender(<ChipList items={[]} />)
    expect(screen.queryByText('None yet')).not.toBeInTheDocument()
    expect(document.querySelector('[data-as="chip-list"]')).toBeNull()
  })

  it('removes via remove button with accessible name', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<ChipList items={['allergy']} onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remove allergy' }))
    expect(onRemove).toHaveBeenCalledWith('allergy')
  })

  it('renders clickable chips as buttons (keyboard operable)', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    render(<ChipList items={['cardio']} onItemClick={onItemClick} showChevron />)
    const chip = screen.getByRole('button', { name: 'cardio' })
    chip.focus()
    await user.keyboard('{Enter}')
    expect(onItemClick).toHaveBeenCalledWith('cardio', 0)
  })

  it('applies the variant tint', () => {
    render(<ChipList items={['x']} variant="danger" />)
    expect(screen.getByText('x')).toHaveClass('text-[var(--as-danger)]')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ChipList items={['a', 'b']} onRemove={() => {}} emptyText="none" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
