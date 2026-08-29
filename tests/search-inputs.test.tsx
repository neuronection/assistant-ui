import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SearchInput } from '../src/components/search-input/SearchInput'
import { ExpandableSearch } from '../src/components/expandable-search/ExpandableSearch'

describe('SearchInput', () => {
  function Host(props: Partial<React.ComponentProps<typeof SearchInput>>) {
    const [value, setValue] = React.useState('')
    return (
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder="Find notes"
        ariaLabel="Search notes"
        {...props}
      />
    )
  }

  it('reports changes, clears, and submits on Enter (keyboard)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Host onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: 'Search notes' })
    await user.type(input, 'lec')
    expect(input).toHaveValue('lec')
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenLastCalledWith('lec')
  })

  it('clears via the clear button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SearchInput value="term" onChange={onChange} placeholder="Find" ariaLabel="Search" />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} placeholder="Find" ariaLabel="Search" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ExpandableSearch', () => {
  function Host(props: Partial<React.ComponentProps<typeof ExpandableSearch>>) {
    const [value, setValue] = React.useState('')
    return (
      <ExpandableSearch
        value={value}
        onChange={setValue}
        placeholder="Find"
        ariaLabel="Search library"
        {...props}
      />
    )
  }

  it('expands on trigger click and focuses the input', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByRole('textbox', { name: 'Search library' })).toHaveFocus()
  })

  it('Escape clears a value before collapsing', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    const input = screen.getByRole('textbox', { name: 'Search library' })
    await user.type(input, 'x')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('textbox', { name: 'Search library' })).toHaveValue('')
    await user.keyboard('{Escape}')
    expect(screen.getByPlaceholderText('Find')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Host />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
