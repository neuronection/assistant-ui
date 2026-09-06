import { useCallback, useEffect, useRef, useState } from 'react'

import type { ChatStreamEvent } from './events'
import { initialLiveTurnState, liveTurnReducer, type LiveTurnAction, type LiveTurnState } from './liveTurnReducer'

export interface ChatStreamTransport {
  /** Enqueue/send a user turn. Resolves when accepted; errors surface as a failed turn. */
  send(input: { text: string }): Promise<void>
  /** Subscribe to the session's stream events; returns an unsubscribe function. */
  subscribe(handlers: { onEvent: (event: ChatStreamEvent) => void }): () => void
  /** Best-effort cancel of the in-flight turn (backend stop endpoint). */
  stop?(): Promise<void>
}

export interface UseChatStreamOptions {
  transport: ChatStreamTransport
  /** Delta coalescing window. Default 33 ms (study's rAF-scale budget). */
  flushMs?: number
  /** Watchdog for a turn that never terminates. Default 90 000 ms. */
  timeoutMs?: number
}

export interface UseChatStreamResult extends LiveTurnState {
  /** The live turn, or `null` when idle — hand to the transcript's `live` slot. */
  live: LiveTurnState | null
  /** Returns false and does nothing for blank input or while a turn is active. */
  send(text: string): Promise<boolean>
  stop(): Promise<void>
  reset(): void
}

/**
 * Transport-injected live-turn state machine for chat surfaces: send →
 * pending → streaming (coalesced text/reasoning deltas, tool calls, node
 * progress) → done / error / interrupted. Persists nothing — the app owns
 * sessions, messages and the branching endpoints; after a terminal state
 * the app refetches and calls `reset()`.
 */
export function useChatStream(options: UseChatStreamOptions): UseChatStreamResult {
  const { transport, flushMs = 33, timeoutMs = 90_000 } = options
  const [state, setState] = useState<LiveTurnState>(initialLiveTurnState)
  const stateRef = useRef(state)
  const dispatch = useCallback((action: LiveTurnAction) => {
    const next = liveTurnReducer(stateRef.current, action)
    stateRef.current = next
    setState(next)
  }, [])

  const transportRef = useRef(transport)
  transportRef.current = transport

  const textBufferRef = useRef('')
  const reasoningBufferRef = useRef('')
  const flushTimerRef = useRef<number | null>(null)
  const timeoutTimerRef = useRef<number | null>(null)
  const terminalRef = useRef(false)

  const cancelFlush = useCallback(() => {
    if (flushTimerRef.current !== null) {
      window.clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
  }, [])

  const flush = useCallback(() => {
    cancelFlush()
    const text = textBufferRef.current
    const reasoning = reasoningBufferRef.current
    textBufferRef.current = ''
    reasoningBufferRef.current = ''
    if (text !== '') {
      dispatch({ type: 'event', event: { event: 'delta', text, kind: 'text' } })
    }
    if (reasoning !== '') {
      dispatch({ type: 'event', event: { event: 'delta', text: reasoning, kind: 'reasoning' } })
    }
  }, [cancelFlush, dispatch])

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current !== null) {
      return
    }
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null
      flush()
    }, flushMs)
  }, [flush, flushMs])

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutTimerRef.current !== null) {
      window.clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const unsubscribe = transportRef.current.subscribe({
      onEvent: (event) => {
        if (terminalRef.current) {
          return
        }
        if (event.event === 'delta') {
          if (event.kind === 'reasoning') {
            reasoningBufferRef.current += event.text
          } else {
            textBufferRef.current += event.text
          }
          scheduleFlush()
          return
        }
        flush()
        if (event.event === 'flow_finished' || event.event === 'flow_failed') {
          terminalRef.current = true
          clearTimeoutTimer()
        }
        dispatch({ type: 'event', event })
      },
    })
    return unsubscribe
  }, [scheduleFlush, flush, clearTimeoutTimer, dispatch])

  useEffect(
    () => () => {
      cancelFlush()
      clearTimeoutTimer()
    },
    [cancelFlush, clearTimeoutTimer],
  )

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      const active = stateRef.current.status === 'pending' || stateRef.current.status === 'streaming'
      if (trimmed === '' || active) {
        return false
      }
      terminalRef.current = false
      textBufferRef.current = ''
      reasoningBufferRef.current = ''
      cancelFlush()
      clearTimeoutTimer()
      dispatch({ type: 'send', at: Date.now() })
      timeoutTimerRef.current = window.setTimeout(() => {
        if (terminalRef.current) {
          return
        }
        terminalRef.current = true
        flush()
        dispatch({
          type: 'event',
          event: { event: 'flow_failed', code: 'timeout', message: 'Chat turn timed out', retryable: true },
        })
      }, timeoutMs)
      try {
        await transportRef.current.send({ text: trimmed })
      } catch (sendError) {
        if (terminalRef.current) {
          return true
        }
        terminalRef.current = true
        clearTimeoutTimer()
        flush()
        dispatch({
          type: 'event',
          event: {
            event: 'flow_failed',
            code: 'send_failed',
            message: sendError instanceof Error ? sendError.message : String(sendError),
            retryable: true,
          },
        })
      }
      return true
    },
    [cancelFlush, clearTimeoutTimer, dispatch, flush, timeoutMs],
  )

  const stop = useCallback(async () => {
    const current = stateRef.current
    if (current.status !== 'pending' && current.status !== 'streaming') {
      return
    }
    terminalRef.current = true
    clearTimeoutTimer()
    flush()
    dispatch({ type: 'stop', at: Date.now() })
    await transportRef.current.stop?.().catch(() => undefined)
  }, [clearTimeoutTimer, dispatch, flush])

  const reset = useCallback(() => {
    terminalRef.current = false
    cancelFlush()
    clearTimeoutTimer()
    dispatch({ type: 'reset' })
  }, [cancelFlush, clearTimeoutTimer, dispatch])

  return {
    ...state,
    live: state.status === 'idle' ? null : state,
    send,
    stop,
    reset,
  }
}
