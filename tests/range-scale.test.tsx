import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { RangeBar } from '../src/components/range-bar/RangeBar'
import { ScaleSlider } from '../src/components/scale-slider/ScaleSlider'

describe('RangeBar', () => {
  it('renders the low–high band within the padded domain', () => {
    const { container } = render(<RangeBar low={40} high={60} />)
    const bar = container.querySelector('[data-as="range-bar"]')
    expect(bar).not.toBeNull()
    expect(bar).toHaveTextContent('40 – 60')
    const band = bar?.querySelector('.absolute') as HTMLElement
    expect(band).toHaveStyle({
      left: '33.33333333333333%',
      width: '33.33333333333333%',
    })
  })

  it('renders the value marker', () => {
    const { container } = render(
      <RangeBar low={40} high={60} value={50} valueLabel="You" />,
    )
    const dot = container.querySelector('[title^="You:"]')
    expect(dot).toHaveAttribute('title', 'You: 50')
  })

  it('honours explicit min/max', () => {
    const { container } = render(<RangeBar low={25} high={75} min={0} max={100} />)
    const band = container.querySelector('.absolute') as HTMLElement
    expect(band).toHaveStyle({ left: '25%', width: '50%' })
  })

  it('renders nothing for inverted or non-finite ranges', () => {
    const { container } = render(<RangeBar low={60} high={40} />)
    expect(container.querySelector('[data-as="range-bar"]')).toBeNull()
    const { container: c2 } = render(<RangeBar low={Number.NaN} high={40} />)
    expect(c2.querySelector('[data-as="range-bar"]')).toBeNull()
  })

  it('shows the label', () => {
    render(<RangeBar low={40} high={60} label="median" />)
    expect(screen.getByText('median')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<RangeBar low={40} high={60} value={55} label="median" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

function ScaleSliderDemo(props: Partial<React.ComponentProps<typeof ScaleSlider>>) {
  const [value, setValue] = React.useState<number | ''>(3)
  return <ScaleSlider min={1} max={5} value={value} onChange={setValue} {...props} />
}

describe('ScaleSlider', () => {
  it('emits numeric values from the range input (keyboard)', async () => {
    const onChange = vi.fn()
    render(<ScaleSlider min={1} max={5} value={2} onChange={onChange} showInput={false} />)
    const slider = screen.getByRole('slider', { name: 'Scale' })
    fireEvent.change(slider, { target: { value: '3' } })
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('keeps slider and number input in sync', async () => {
    const user = userEvent.setup()
    render(<ScaleSliderDemo />)
    const input = screen.getByRole('spinbutton', { name: 'Scale value' })
    await user.clear(input)
    await user.type(input, '5')
    expect(input).toHaveValue(5)
  })

  it('allows clearing and clamps on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Demo() {
      const [value, setValue] = React.useState<number | ''>(4)
      return (
        <ScaleSlider
          min={1}
          max={5}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Demo />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    expect(onChange).toHaveBeenCalledWith('')
    await user.type(input, '99')
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('emits an empty value when the input is cleared', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ScaleSlider min={1} max={5} value={3} onChange={onChange} />)
    await user.clear(screen.getByRole('spinbutton'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('shows low/high labels and honours showInput={false}', () => {
    render(<ScaleSliderDemo lowLabel="meh" highLabel="love it" showInput={false} />)
    expect(screen.getByText('meh')).toBeInTheDocument()
    expect(screen.getByText('love it')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('disables both controls when disabled', () => {
    render(<ScaleSliderDemo disabled />)
    expect(screen.getByRole('slider')).toBeDisabled()
    expect(screen.getByRole('spinbutton')).toBeDisabled()
  })

  it('forwards refs to the root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<ScaleSlider min={1} max={5} value={3} onChange={() => {}} ref={ref} />)
    expect(ref.current).toHaveAttribute('data-as', 'scale-slider')
  })

  it('has no axe violations', async () => {
    const { container } = render(<ScaleSliderDemo lowLabel="meh" highLabel="love it" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
