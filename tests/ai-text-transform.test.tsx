import { describe, expect, it, vi, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  useAiTextTransform,
  type AiTextTransformTransport,
  type AiTextTransformEventHandlers,
} from '../src/components/ai-text-transform'

interface Probe {
  status: string
  result: string
  error: string | null
  start: () => Promise<void>
  stop: () => Promise<void>
  reset: () => void
}

function makeTransport(): {
  transport: AiTextTransformTransport
  emit: {
    delta: (text: string) => void
    done: (result: string) => void
    error: (message: string) => void
  }
} {
  let subscriber: AiTextTransformEventHandlers | null = null
  const transport: AiTextTransformTransport = {
    start: vi.fn(async () => 'job-1'),
    subscribe: vi.fn((_jobId: string, handlers: AiTextTransformEventHandlers) => {
      subscriber = handlers
      return () => {
        subscriber = null
      }
    }),
    cancel: vi.fn(async () => undefined),
    poll: vi.fn(async () => ({ status: 'running' as const })),
  }
  return {
    transport,
    emit: {
      delta: (text) => subscriber?.onDelta(text),
      done: (result) => subscriber?.onDone(result),
      error: (message) => subscriber?.onError(message),
    },
  }
}

function Probe({
  transport,
  capture,
}: {
  transport: AiTextTransformTransport
  capture: { current: Probe | null }
}) {
  const transform = useAiTextTransform({ transport })
  capture.current = transform as unknown as Probe
  return (
    <div>
      <p data-status={transform.status}>{transform.status}</p>
      <p data-result={transform.result} />
      <p data-error={transform.error ?? ''} />
      <button type="button" onClick={() => void transform.start()}>
        Start
      </button>
      <button type="button" onClick={() => void transform.stop()}>
        Stop
      </button>
      <button type="button" onClick={transform.reset}>
        Reset
      </button>
    </div>
  )
}

function setup(transport: AiTextTransformTransport) {
  const capture = { current: null as Probe | null }
  render(<Probe transport={transport} capture={capture} />)
  const click = (name: string) => {
    fireEvent.click(screen.getByRole('button', { name }))
  }
  return { capture, click }
}

describe('useAiTextTransform', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('streams deltas (coalesced), then done sets the final result', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('running')
    emit.delta('The ')
    emit.delta('limit ')
    emit.delta('definition')
    await vi.advanceTimersByTimeAsync(50)
    expect(capture.current?.result).toBe('The limit definition')
    emit.done('The limit definition.')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('done')
    expect(capture.current?.result).toBe('The limit definition.')
  })

  it('surfaces error events', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    emit.error('model exploded')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('error')
    expect(capture.current?.error).toBe('model exploded')
  })

  it('reports a failed start', async () => {
    vi.useFakeTimers()
    const transport = makeTransport().transport
    transport.start = vi.fn(async () => {
      throw new Error('no provider')
    })
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('error')
    expect(capture.current?.error).toBe('no provider')
  })

  it('polls a running job as a fallback and adopts the terminal state', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    let pollCount = 0
    transport.poll = vi.fn(async () => {
      pollCount += 1
      return pollCount >= 2
        ? ({ status: 'done', result: 'from poll' } as const)
        : ({ status: 'running' } as const)
    })
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(800)
    await vi.advanceTimersByTimeAsync(800)
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('done')
    expect(capture.current?.result).toBe('from poll')
    emit.done('late events are ignored after done')
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.result).toBe('from poll')
  })

  it('times out a stuck job when polling is configured', async () => {
    vi.useFakeTimers()
    const { transport } = makeTransport()
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(800)
    await vi.advanceTimersByTimeAsync(90_000)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(0)
    expect(capture.current?.status).toBe('error')
    expect(capture.current?.error).toBe('AI transform timed out')
  })

  it('cancel detaches and reports cancelled', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    emit.delta('partial ')
    await vi.advanceTimersByTimeAsync(0)
    click('Stop')
    await vi.advanceTimersByTimeAsync(0)
    expect(transport.cancel).toHaveBeenCalledWith('job-1')
    expect(capture.current?.status).toBe('cancelled')
  })

  it('reset returns to a clean idle state', async () => {
    vi.useFakeTimers()
    const { transport, emit } = makeTransport()
    const { capture, click } = setup(transport)
    click('Start')
    await vi.advanceTimersByTimeAsync(0)
    emit.done('result text')
    await vi.advanceTimersByTimeAsync(0)
    click('Reset')
    expect(capture.current?.status).toBe('idle')
    expect(capture.current?.result).toBe('')
    expect(capture.current?.error).toBeNull()
  })

  it('start/stop/reset closures stay stable across renders', () => {
    const { transport } = makeTransport()
    const capture = { current: null as Probe | null }
    const { rerender } = render(<Probe transport={transport} capture={capture} />)
    const first = { ...capture.current! }
    rerender(<Probe transport={transport} capture={capture} />)
    expect(capture.current?.start).toBe(first.start)
    expect(capture.current?.stop).toBe(first.stop)
    expect(capture.current?.reset).toBe(first.reset)
  })
})
