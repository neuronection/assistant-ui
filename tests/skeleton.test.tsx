import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Skeleton, SkeletonText } from '../src/components/skeleton/Skeleton'

describe('Skeleton', () => {
  it('renders a hidden decorative block', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('data-as', 'skeleton')
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges className and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Skeleton ref={ref} className="h-4 w-32 rounded-full" />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.className).toContain('bg-[var(--as-muted)]')
    expect(ref.current?.className).toContain('rounded-full')
    expect(ref.current?.className).not.toContain('rounded-md')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SkeletonText', () => {
  it('renders the requested number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const rows = container.querySelectorAll('[data-as="skeleton"]')
    expect(rows).toHaveLength(5)
  })

  it('shortens only the last line by the ratio', () => {
    const { container } = render(<SkeletonText lines={3} lastLineRatio={0.5} />)
    const rows = container.querySelectorAll('[data-as="skeleton"]')
    expect(rows[0]).not.toHaveStyle({ width: '50%' })
    expect(rows[2]).toHaveStyle({ width: '50%' })
  })

  it('keeps a single line full width', () => {
    const { container } = render(<SkeletonText lines={1} />)
    const rows = container.querySelectorAll('[data-as="skeleton"]')
    expect(rows).toHaveLength(1)
    expect(rows[0]).not.toHaveAttribute('style')
  })

  it('clamps line counts into the 1..12 range', () => {
    const { container } = render(<SkeletonText lines={99} />)
    expect(container.querySelectorAll('[data-as="skeleton"]')).toHaveLength(12)
  })

  it('is hidden from the a11y tree', () => {
    const { container } = render(<SkeletonText />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonText lines={3} />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
