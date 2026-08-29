import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from '../src/components/badge/Badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../src/components/card/Card'

describe('Badge', () => {
  it('renders with variant class', () => {
    render(<Badge variant="ai">AI</Badge>)
    const badge = screen.getByText('AI')
    expect(badge).toHaveAttribute('data-as', 'badge')
    expect(badge.className).toContain('bg-[var(--as-ai)]')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Badge>Plain</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Card', () => {
  it('renders all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>Connect AI providers</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Providers')).toBeInTheDocument()
    expect(screen.getByText('Connect AI providers')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
