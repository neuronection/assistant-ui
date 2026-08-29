import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Table } from '../src/components/table/Table'

describe('Table', () => {
  it('renders headers and rows', () => {
    render(
      <Table
        headers={['Role', 'Fit']}
        rows={[
          ['Backend', '92%'],
          ['Frontend', '81%'],
        ]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('renders emptyText spanning all columns', () => {
    render(<Table headers={['A', 'B']} rows={[]} emptyText="Nothing here" />)
    const cell = screen.getByText('Nothing here')
    expect(cell).toHaveAttribute('colspan', '2')
  })

  it('renders a default empty message', () => {
    render(<Table headers={['A']} rows={[]} />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })

  it('accepts node cells and className', () => {
    const { container } = render(
      <Table
        headers={['H']}
        rows={[[<strong key="k">bold</strong>]]}
        className="mt-4"
      />,
    )
    expect(container.querySelector('strong')).toBeInTheDocument()
    expect(container.querySelector('[data-as="table"]')).toHaveClass('mt-4')
  })

  it('forwards refs to the scroll wrapper', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Table ref={ref} headers={[]} rows={[]} />)
    expect(ref.current).toHaveAttribute('data-as', 'table')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Table headers={['Role', 'Fit']} rows={[['Backend', '92%']]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
