import { describe, expect, it, vi, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ChatTurnStatus } from '../src/components/chat-turn-status'

describe('ChatTurnStatus', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes a labelled status region with the phase label', () => {
    render(<ChatTurnStatus label="searching the catalog" startedAt={Date.now()} />)
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'searching the catalog',
    )
    expect(screen.getByText('searching the catalog')).toBeInTheDocument()
    expect(
      screen.getByLabelText('searching the catalog'),
    ).toHaveAttribute('data-as', 'chat-turn-status')
  })

  it('ticks an elapsed timer on a 100 ms cadence (tabular-nums)', () => {
    vi.useFakeTimers()
    const startedAt = Date.now()
    render(<ChatTurnStatus label="thinking" startedAt={startedAt} />)
    expect(screen.getByText('0 ms')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('1.5 s')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(9700)
    })
    expect(screen.getByText('11 s')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('12 s')).toBeInTheDocument()
  })

  it('renders milliseconds below one second', () => {
    vi.useFakeTimers()
    render(<ChatTurnStatus label="thinking" startedAt={Date.now()} />)
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.getByText('300 ms')).toBeInTheDocument()
  })

  it('omits the timer without startedAt', () => {
    vi.useFakeTimers()
    render(<ChatTurnStatus label="thinking" />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.queryByText(/ms|s$/)).not.toBeInTheDocument()
  })

  it('honors a custom tick interval', () => {
    vi.useFakeTimers()
    render(<ChatTurnStatus label="thinking" startedAt={Date.now()} tickMs={1000} />)
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(screen.getByText('0 ms')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByText('1.0 s')).toBeInTheDocument()
  })

  it('switches to the soft card variant on request', () => {
    const { container, rerender } = render(
      <ChatTurnStatus label="thinking" variant="card" />,
    )
    expect(container.querySelector('[data-variant="card"]')).toBeInTheDocument()
    rerender(<ChatTurnStatus label="thinking" />)
    expect(container.querySelector('[data-variant="row"]')).toBeInTheDocument()
  })

  it('keeps the timer text out of the live announcement and offers an sr-only description', () => {
    render(
      <ChatTurnStatus
        label="thinking"
        startedAt={Date.now()}
        labels={{ timer: 'Elapsed time shown beside the phase' }}
      />,
    )
    expect(screen.getByText('Elapsed time shown beside the phase')).toHaveClass(
      'sr-only',
    )
  })

  it('passes axe in both variants while ticking', async () => {
    const row = render(
      <ChatTurnStatus label="searching the catalog" startedAt={Date.now()} />,
    )
    expect(await axe(row.container)).toHaveNoViolations()
    row.unmount()
    const card = render(
      <ChatTurnStatus label="writing the reply" startedAt={Date.now()} variant="card" />,
    )
    expect(await axe(card.container)).toHaveNoViolations()
  })
})
