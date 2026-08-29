import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Breadcrumbs } from '../src/components/breadcrumbs/Breadcrumbs'
import { CopyButton } from '../src/components/copy-button/CopyButton'

describe('Breadcrumbs', () => {
  it('renders links, current label and home link', () => {
    render(
      <Breadcrumbs
        homeHref="/"
        items={[
          { label: 'Doctors', href: '/doctors' },
          { label: 'Dr. Mara' },
        ]}
        currentLabel="Overview"
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Doctors' })).toHaveAttribute('href', '/doctors')
    expect(screen.getByText('Dr. Mara')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toHaveAttribute('aria-current', 'page')
  })

  it('renders route items without href as plain text', () => {
    render(<Breadcrumbs items={[{ label: 'Plain' }]} />)
    expect(screen.getByText('Plain')).not.toHaveAttribute('href')
  })

  it('renders nothing without items, current label or home', () => {
    const { container } = render(<Breadcrumbs />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses linkComponent for SPA routing', () => {
    const FakeLink = ({
      href,
      className,
      children,
    }: {
      href: string
      className?: string
      children: React.ReactNode
    }) => (
      <a href={href} className={className} data-testid="router-link">
        {children}
      </a>
    )
    render(
      <Breadcrumbs linkComponent={FakeLink} items={[{ label: 'A', href: '/a' }]} currentLabel="B" />,
    )
    expect(screen.getAllByTestId('router-link')).toHaveLength(1)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Breadcrumbs homeHref="/" items={[{ label: 'A', href: '/a' }]} currentLabel="B" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CopyButton', () => {
  function withClipboard(result: Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => result) },
      configurable: true,
    })
  }

  it('copies the value and shows the copied state', async () => {
    const user = userEvent.setup()
    withClipboard(Promise.resolve())
    const onCopied = vi.fn()
    const { container } = render(<CopyButton value="abc" label="Copy code" onCopied={onCopied} />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc')
    expect(container.querySelector('[data-as="copy-button"]')).toHaveAttribute('data-copied')
    expect(onCopied).toHaveBeenCalled()
  })

  it('reports copy errors via callback', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) },
      configurable: true,
    })
    const onCopyError = vi.fn()
    render(<CopyButton value="abc" onCopyError={onCopyError} />)
    await user.click(screen.getByRole('button'))
    expect(onCopyError).toHaveBeenCalled()
  })

  it('is hidden when the value is empty and hideWhenEmpty is set', () => {
    const { container } = render(<CopyButton value="" />)
    expect(container).toBeEmptyDOMElement()
    render(<CopyButton value="" hideWhenEmpty={false} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('stops propagation so card-level clicks do not fire', async () => {
    withClipboard(Promise.resolve())
    const cardClick = vi.fn()
    const { container } = render(
      <div onClick={cardClick}>
        <CopyButton value="x" />
      </div>,
    )
    fireEvent.click(container.querySelector('button')!)
    expect(cardClick).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(<CopyButton value="value" label="Copy JSON" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
