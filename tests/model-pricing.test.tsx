import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ModelPriceMeta } from '../src/components/model-price-meta/ModelPriceMeta'
import {
  ModelPriceTable,
  microsToUsdPerMillion,
  usdPerMillionToMicros,
  type ModelPriceRow,
} from '../src/components/model-price-table/ModelPriceTable'

describe('ModelPriceMeta', () => {
  it('shows the rate, origin and checked date for a built-in price', () => {
    render(
      <ModelPriceMeta
        inputMicrosPerMillion={75_000}
        outputMicrosPerMillion={300_000}
        origin="builtin"
        reviewedAt="2026-11-01"
        now={new Date('2026-11-11T00:00:00Z')}
      />,
    )
    expect(screen.getByText('Built-in')).toBeInTheDocument()
    expect(screen.getByText('$0.0750/M in · $0.3000/M out')).toBeInTheDocument()
    expect(screen.getByText(/checked 2026-11-01/)).toBeInTheDocument()
  })

  it('renders Unpriced for unknown or null rates, never $0', () => {
    const { rerender } = render(
      <ModelPriceMeta
        inputMicrosPerMillion={null}
        outputMicrosPerMillion={null}
        origin="unknown"
      />,
    )
    expect(screen.getByText('Unpriced')).toBeInTheDocument()
    expect(screen.queryByText(/\$0/)).not.toBeInTheDocument()

    rerender(
      <ModelPriceMeta
        inputMicrosPerMillion={1_000_000}
        outputMicrosPerMillion={null}
        origin="user"
      />,
    )
    expect(screen.getByText('Unpriced')).toBeInTheDocument()
  })

  it('marks a reviewed rate stale and opens the prices editor', async () => {
    const user = userEvent.setup()
    const onOpenPrices = vi.fn()
    render(
      <ModelPriceMeta
        inputMicrosPerMillion={75_000}
        outputMicrosPerMillion={300_000}
        origin="builtin"
        reviewedAt="2026-01-01"
        now={new Date('2026-11-11T00:00:00Z')}
        onOpenPrices={onOpenPrices}
      />,
    )
    expect(screen.getByText(/stale/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Prices' }))
    expect(onOpenPrices).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ModelPriceMeta
        inputMicrosPerMillion={75_000}
        outputMicrosPerMillion={300_000}
        origin="builtin"
        reviewedAt="2026-11-01"
        onOpenPrices={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

const rows: ModelPriceRow[] = [
  {
    id: 'builtin',
    providerKey: 'openai',
    model: 'gpt-5',
    match: 'exact',
    inputMicrosPerMillion: 1_250_000,
    outputMicrosPerMillion: 10_000_000,
    origin: 'builtin',
    reviewedAt: '2026-11-01',
    priceVersion: 'model-pricing/1:2026-11-01:abcd1234',
  },
  {
    id: 'custom',
    providerKey: null,
    model: 'local-model',
    match: 'exact',
    inputMicrosPerMillion: null,
    outputMicrosPerMillion: null,
    origin: 'unknown',
  },
]

describe('ModelPriceTable', () => {
  it('converts USD per million to integer micros and back', () => {
    expect(usdPerMillionToMicros('0.075')).toBe(75_000)
    expect(microsToUsdPerMillion(75_000)).toBe('0.075')
    expect(usdPerMillionToMicros('')).toBeNull()
    expect(usdPerMillionToMicros('-1')).toBeNull()
  })

  it('renders effective rows and never relabels an unpriced row as $0', () => {
    render(<ModelPriceTable rows={rows} />)
    expect(screen.getByText('gpt-5')).toBeInTheDocument()
    expect(screen.getByText('Built-in')).toBeInTheDocument()
    expect(screen.getAllByText('Unpriced').length).toBeGreaterThan(0)
    expect(screen.queryByText(/\$0\.0000\/M/)).not.toBeInTheDocument()
  })

  it('emits controlled edits, reset and add callbacks', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onReset = vi.fn()
    const onAdd = vi.fn()
    render(
      <ModelPriceTable
        rows={rows}
        onChange={onChange}
        onReset={onReset}
        onAdd={onAdd}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: /Input \$\/1M 1/ })
    fireEvent.change(input, { target: { value: '0.075' } })
    expect(onChange).toHaveBeenLastCalledWith('builtin', {
      inputMicrosPerMillion: 75_000,
    })
    await user.click(
      screen.getByRole('button', { name: 'Reset gpt-5' }),
    )
    expect(onReset).toHaveBeenCalledWith('builtin')
    await user.click(screen.getByRole('button', { name: 'Add price' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ModelPriceTable rows={rows} onChange={vi.fn()} onAdd={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
