import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CareerMark } from '../src/components/logo/CareerMark'
import { HealthMark } from '../src/components/logo/HealthMark'
import { StudyMark } from '../src/components/logo/StudyMark'
import { NeuronectionMark } from '../src/components/logo/NeuronectionMark'
import { NeuronectionWordmark } from '../src/components/logo/NeuronectionWordmark'

const marks = [
  ['career', CareerMark],
  ['health', HealthMark],
  ['study', StudyMark],
  ['neuronection', NeuronectionMark],
] as const

describe('logo marks', () => {
  it.each(marks)('renders %s mark with data hooks', (logo, Mark) => {
    const { container } = render(<Mark />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-as', 'logo')
    expect(svg).toHaveAttribute('data-as-logo', logo)
    expect(svg).toHaveAttribute('data-as-theme', 'light')
  })

  it.each(marks)('%s mark is decorative and not focusable', (logo, Mark) => {
    const { container } = render(<Mark />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
  })

  it.each(marks)('%s mark exposes an accessible name via title', (logo, Mark) => {
    render(<Mark title={`${logo} assistant`} />)
    expect(screen.getByRole('img', { name: `${logo} assistant` })).toBeInTheDocument()
  })

  it.each(marks)('%s mark applies size', (logo, Mark) => {
    const { container } = render(<Mark size={48} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('switches tile artwork with theme', () => {
    const { container } = render(<CareerMark theme="dark" />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('data-as-theme', 'dark')
    expect(container.querySelector('stop')?.getAttribute('stop-color')).toBe('#0F172A')
    const light = render(<CareerMark theme="light" />)
    expect(
      light.container.querySelector('stop')?.getAttribute('stop-color'),
    ).toBe('#FFFFFF')
  })

  it('namespaces gradient ids per instance', () => {
    const { container } = render(
      <>
        <CareerMark />
        <CareerMark />
        <HealthMark />
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <NeuronectionMark />
        <CareerMark />
        <StudyMark />
        <HealthMark />
        <NeuronectionWordmark />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('NeuronectionWordmark', () => {
  it('renders with data hooks and aspect-aware size', () => {
    const { container } = render(<NeuronectionWordmark size={20} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('data-as-logo', 'neuronection-wordmark')
    expect(svg).toHaveAttribute('height', '20')
    expect(Number(svg.getAttribute('width'))).toBeGreaterThan(20)
  })

  it('uses brand ink per theme and currentColor when mono', () => {
    const { container } = render(<NeuronectionWordmark />)
    expect(container.querySelector('path')).toHaveAttribute('fill', '#055F9C')
    const dark = render(<NeuronectionWordmark theme="dark" />)
    expect(dark.container.querySelector('path')).toHaveAttribute('fill', '#2BA0EE')
    const mono = render(<NeuronectionWordmark mono />)
    expect(mono.container.querySelector('path')).toHaveAttribute('fill', 'currentColor')
  })
})
