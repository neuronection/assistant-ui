import { useCallback, useEffect, useRef, useState } from 'react'

export type AiTextTransformStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled'

export interface AiTextTransformEventHandlers {
  onDelta: (text: string) => void
  onDone: (result: string) => void
  onError: (message: string) => void
}

export interface AiTextTransformTransport {
  /** Begin the job and resolve with its handle (e.g. a job id). */
  start: () => Promise<string>
  /** Subscribe to a job's events; returns an unsubscribe function. */
  subscribe: (jobId: string, handlers: AiTextTransformEventHandlers) => () => void
  cancel?: (jobId: string) => Promise<void>
  /** Optional status fallback when events may be missed. */
  poll?: (
    jobId: string,
  ) => Promise<{
    status: 'running' | 'done' | 'error' | 'cancelled'
    result?: string
    error?: string
  }>
}

export interface UseAiTextTransformOptions {
  transport: AiTextTransformTransport
  /** Status-fallback interval when `poll` is provided. Default 800 ms. */
  pollIntervalMs?: number
  /** Hard timeout for a running job. Default 90 000 ms. */
  timeoutMs?: number
  /** Streaming delta coalescing window. Default 50 ms. */
  flushMs?: number
}

/**
 * Streaming text-transform state machine (idle → running → done/error/
 * cancelled). Transport-injected: the app provides start/subscribe/cancel/
 * poll closures over its own gateway; this hook owns status transitions,
 * delta coalescing, the poll fallback and the hard timeout.
 */
export function useAiTextTransform(options: UseAiTextTransformOptions) {
  const {
    transport,
    pollIntervalMs = 800,
    timeoutMs = 90_000,
    flushMs = 50,
  } = options
  const [status, setStatus] = useState<AiTextTransformStatus>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)

  const transportRef = useRef(transport)
  transportRef.current = transport

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const bufferRef = useRef('')
  const flushTimerRef = useRef<number | null>(null)
  const lastFlushRef = useRef(0)
  const terminalRef = useRef(false)

  const cancelFlush = useCallback(() => {
    if (flushTimerRef.current !== null) {
      window.clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
  }, [])

  const flush = useCallback(() => {
    cancelFlush()
    lastFlushRef.current = Date.now()
    if (bufferRef.current !== '') {
      const chunk = bufferRef.current
      bufferRef.current = ''
      setResult((current) => current + chunk)
    }
  }, [cancelFlush])

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current !== null) {
      return
    }
    const elapsed = Date.now() - lastFlushRef.current
    const delay = Math.max(0, flushMs - elapsed)
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null
      flush()
    }, delay)
  }, [flush, flushMs])

  const detach = useCallback(() => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    cancelFlush()
  }, [cancelFlush])

  const start = useCallback(async () => {
    detach()
    bufferRef.current = ''
    lastFlushRef.current = 0
    terminalRef.current = false
    setStatus('running')
    setResult('')
    setError(null)
    setJobId(null)
    let jobIdResolved: string
    try {
      jobIdResolved = await transportRef.current.start()
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : String(startError))
      setStatus('error')
      return
    }
    setJobId(jobIdResolved)
    unsubscribeRef.current = transportRef.current.subscribe(jobIdResolved, {
      onDelta: (text) => {
        if (terminalRef.current) {
          return
        }
        bufferRef.current += text
        scheduleFlush()
      },
      onDone: (finalResult) => {
        if (terminalRef.current) {
          return
        }
        terminalRef.current = true
        bufferRef.current = ''
        flush()
        setResult(finalResult)
        setStatus('done')
      },
      onError: (message) => {
        if (terminalRef.current) {
          return
        }
        terminalRef.current = true
        bufferRef.current = ''
        flush()
        setError(message)
        setStatus('error')
      },
    })
  }, [detach, flush, scheduleFlush])

  const stop = useCallback(async () => {
    const currentJobId = jobId
    terminalRef.current = true
    if (currentJobId !== null) {
      detach()
      await transportRef.current.cancel?.(currentJobId).catch(() => undefined)
    }
    setStatus('cancelled')
  }, [detach, jobId])

  const reset = useCallback(() => {
    terminalRef.current = false
    detach()
    setJobId(null)
    setResult('')
    setError(null)
    setStatus('idle')
  }, [detach])

  useEffect(() => {
    if (status !== 'running' || jobId === null || transportRef.current.poll === undefined) {
      return
    }
    const poll = () => {
      transportRef.current
        .poll!(jobId)
        .then((job) => {
          if (job.status === 'done') {
            terminalRef.current = true
            bufferRef.current = ''
            cancelFlush()
            setResult(job.result ?? '')
            setStatus('done')
          } else if (job.status === 'error') {
            terminalRef.current = true
            setError(job.error ?? 'AI transform failed')
            setStatus('error')
          } else if (job.status === 'cancelled') {
            terminalRef.current = true
            setStatus('cancelled')
          }
        })
        .catch(() => undefined)
    }
    const timer = window.setInterval(poll, pollIntervalMs)
    const timeout = window.setTimeout(() => {
      setError('AI transform timed out')
      setStatus('error')
    }, timeoutMs)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(timeout)
    }
  }, [status, jobId, pollIntervalMs, timeoutMs, cancelFlush])

  useEffect(() => detach, [detach])

  return { status, result, error, start, stop, reset }
}
