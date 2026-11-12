export interface FlowStepInfo {
  id: string
  label?: string
}

/**
 * Family streaming vocabulary (guidelines/ai-features.md §5), extended with
 * the `tool_call` observation event and the terminal `flow_interrupted`
 * stop. `interrupt` is the resumable HITL pause; `flow_interrupted` is the
 * terminal cancel the server broadcasts so every consumer of the turn
 * learns it was stopped. Transports map their wire format (SSE named
 * events, WS topic payloads) onto these shapes app-side; the reducer
 * tolerates unknown `event` values by ignoring them.
 */
export type ChatStreamEvent =
  | { event: 'flow_started'; flow: string; run_id?: string; steps?: FlowStepInfo[] }
  | { event: 'node_started'; node: string; label?: string; run_id?: string }
  | {
      event: 'node_finished'
      node: string
      label?: string
      outcome: 'done' | 'failed' | 'interrupted'
      run_id?: string
    }
  | { event: 'delta'; text: string; kind?: 'text' | 'reasoning'; run_id?: string }
  | {
      event: 'tool_call'
      id: string
      name: string
      title?: string
      status: 'running' | 'done' | 'failed'
      args?: string
      result?: string
      durationMs?: number
      run_id?: string
    }
  | { event: 'interrupt'; payload: unknown; run_id?: string }
  | { event: 'flow_finished'; result_ref?: string; summary?: string; run_id?: string }
  | {
      event: 'flow_failed'
      code: string
      message: string
      retryable: boolean
      run_id?: string
    }
  | { event: 'flow_interrupted'; reason?: 'user' | 'server'; partial?: boolean }
