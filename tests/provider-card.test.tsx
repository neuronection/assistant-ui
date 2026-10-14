import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ProviderCard } from '../src/components/provider-card/ProviderCard'

const base = {
  name: 'Org OpenAI',
  logoPreset: 'openai',
  nameTitle: 'https://api.openai.com/v1',
  badges: [
    { key: 'type', label: 'openai' },
    { key: 'hosting', label: 'Cloud', testId: 'provider-hosting-p1' },
    { key: 'inactive', label: 'Inactive', danger: true },
  ],
  meta: '4 models',
  okLabel: 'Connected',
  failLabel: 'Failed',
}

describe('ProviderCard', () => {
  it('renders name, tooltip, badges and the status meta', () => {
    render(<ProviderCard {...base} status="ok" />)
    const name = screen.getByText('Org OpenAI')
    expect(name).toHaveAttribute('title', 'https://api.openai.com/v1')
    expect(screen.getByText('openai')).toBeInTheDocument()
    expect(screen.getByTestId('provider-hosting-p1')).toHaveTextContent('Cloud')
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText('4 models')).toBeInTheDocument()
  })

  it('the subtitle renders discretely with the full text on its tooltip', () => {
    render(
      <ProviderCard
        {...base}
        status="idle"
        subtitle="https://my-proxy.example/v1"
      />,
    )
    const line = screen.getByText('https://my-proxy.example/v1')
    expect(line).toHaveAttribute('title', 'https://my-proxy.example/v1')
  })

  it('ok status reads the okLabel; fail status surfaces the error', () => {
    const { rerender } = render(<ProviderCard {...base} status="ok" />)
    expect(screen.getByText('Connected')).toBeInTheDocument()

    rerender(
      <ProviderCard {...base} status="fail" errorMessage="401 — check key" />,
    )
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('401 — check key')).toBeInTheDocument()
  })

  it('no inline test action — the test lives in the overflow menu', () => {
    const onSelect = vi.fn()
    render(
      <ProviderCard
        {...base}
        status="idle"
        actionsLabel="Actions for Org OpenAI"
        actions={[
          {
            key: 'test',
            label: 'Test connection',
            onSelect,
          },
          { key: 'delete', label: 'Delete', danger: true, onSelect: vi.fn() },
        ]}
      />,
    )
    expect(screen.queryByRole('button', { name: /^test/i })).toBeNull()
    const menuButton = screen.getByRole('button', {
      name: 'Actions for Org OpenAI',
    })
    expect(menuButton).toBeInTheDocument()
    expect(screen.queryByRole('menuitem')).toBeNull()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('menu items fire onSelect; danger item is reachable', async () => {
    const user = userEvent.setup()
    const onTest = vi.fn()
    const onDelete = vi.fn()
    render(
      <ProviderCard
        {...base}
        status="idle"
        actionsLabel="Actions for Org OpenAI"
        actions={[
          { key: 'test', label: 'Test connection', onSelect: onTest },
          { key: 'delete', label: 'Delete', danger: true, onSelect: onDelete },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Actions for Org OpenAI' }))
    await user.click(screen.getByRole('menuitem', { name: 'Test connection' }))
    expect(onTest).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Actions for Org OpenAI' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('disabled actions render inert', async () => {
    const user = userEvent.setup()
    const onTest = vi.fn()
    render(
      <ProviderCard
        {...base}
        status="idle"
        actionsLabel="Actions"
        actions={[
          { key: 'test', label: 'Test connection', disabled: true, onSelect: onTest },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = screen.getByRole('menuitem', { name: 'Test connection' })
    expect(item).toHaveAttribute('data-disabled')
    await user.click(item)
    expect(onTest).not.toHaveBeenCalled()
  })

  it('no actions — the menu does not render (read-only contexts)', () => {
    render(<ProviderCard {...base} status="idle" actions={[]} />)
    expect(screen.queryByRole('button', { name: /org openai/i })).toBeNull()
    expect(screen.queryByRole('menuitem')).toBeNull()
  })

  it('has no accessibility violations in idle and fail states', async () => {
    const { container, rerender } = render(
      <ProviderCard
        {...base}
        status="idle"
        actionsLabel="Actions for Org OpenAI"
        actions={[{ key: 'test', label: 'Test connection', onSelect: vi.fn() }]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()

    rerender(
      <ProviderCard
        {...base}
        status="fail"
        errorMessage="401"
        actionsLabel="Actions for Org OpenAI"
        actions={[{ key: 'test', label: 'Test connection', onSelect: vi.fn() }]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards the ref and spreads extra props', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ProviderCard
        ref={ref}
        {...base}
        status="idle"
        data-testid="x"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.dataset.testid).toBe('x')
  })
})
