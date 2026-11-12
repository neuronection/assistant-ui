import type { ChatStreamEvent } from './events'
import type { ChatError } from './types'

export type LiveTurnStatus = 'idle' | 'pending' | 'streaming' | 'interrupted' | 'done' | 'error'

export interface LiveNodeState {
  id: string
  label?: string
  status: 'pending' | 'running' | 'done' | 'failed' | 'interrupted'
}

export interface LiveToolCall {
  id: string
  name: string
  title?: string
  status: 'running' | 'done' | 'failed'
  args?: string
  result?: string
  durationMs?: number
}

/**
 * Ephemeral state of the in-flight assistant turn. `text`/`reasoning` are
 * `null` until the first delta (study's "not streaming yet" sentinel).
 * `status: 'interrupted'` has two distinct readings: the HITL `interrupt`
 * event is a *resumable pause* — it carries `interruptPayload` and the
 * next delta streams again — while a *stop* is terminal for event intake:
 * the local `stop` action (the user cancel this consumer issued) or the
 * server-broadcast `flow_interrupted` event (how a consumer that did NOT
 * issue the stop learns the turn was cancelled, e.g. another tab). Both
 * stop paths set `stopped: true`; `stopped`/`done`/`error` close intake.
 */
export interface LiveTurnState {
  status: LiveTurnStatus
  text: string | null
  reasoning: string | null
  toolCalls: LiveToolCall[]
  nodes: LiveNodeState[]
  error: ChatError | null
  interruptPayload: unknown | null
  runId: string | null
  stopped: boolean
  startedAt: number | null
  finishedAt: number | null
}

export type LiveTurnAction =
  | { type: 'send'; at: number }
  | { type: 'event'; event: ChatStreamEvent; at?: number }
  | { type: 'stop'; at: number }
  | { type: 'reset' }

export const initialLiveTurnState: LiveTurnState = {
  status: 'idle',
  text: null,
  reasoning: null,
  toolCalls: [],
  nodes: [],
  error: null,
  interruptPayload: null,
  runId: null,
  stopped: false,
  startedAt: null,
  finishedAt: null,
}

function isTerminal(state: LiveTurnState): boolean {
  return state.status === 'done' || state.status === 'error' || state.stopped
}

function upsertNode(nodes: LiveNodeState[], id: string, label: string | undefined, status: LiveNodeState['status']): LiveNodeState[] {
  const index = nodes.findIndex((node) => node.id === id)
  if (index === -1) {
    return [...nodes, { id, label, status }]
  }
  const next = nodes.slice()
  const current = next[index]!
  next[index] = { ...current, label: label ?? current.label, status }
  return next
}

function upsertToolCall(state: LiveTurnState, event: Extract<ChatStreamEvent, { event: 'tool_call' }>): LiveToolCall[] {
  const index = state.toolCalls.findIndex((call) => call.id === event.id)
  const merged = {
    id: event.id,
    name: event.name,
    title: event.title,
    status: event.status,
    args: event.args,
    result: event.result,
    durationMs: event.durationMs,
  }
  if (index === -1) {
    return [...state.toolCalls, merged]
  }
  const next = state.toolCalls.slice()
  const current = next[index]!
  next[index] = {
    ...current,
    ...merged,
    title: merged.title ?? current.title,
    args: merged.args ?? current.args,
    result: merged.result ?? current.result,
    durationMs: merged.durationMs ?? current.durationMs,
  }
  return next
}

/**
 * Pure state machine for one streamed assistant turn — the fixture-testable
 * core behind `useChatStream` (same role career's `chatFlow.ts` plays for
 * `FlowStatusCard`). Unknown event names are ignored (additive contract).
 */
export function liveTurnReducer(state: LiveTurnState, action: LiveTurnAction): LiveTurnState {
  switch (action.type) {
    case 'send':
      return { ...initialLiveTurnState, status: 'pending', startedAt: action.at }
    case 'stop': {
      if (state.status !== 'pending' && state.status !== 'streaming') {
        return state
      }
      return { ...state, status: 'interrupted', stopped: true, finishedAt: action.at }
    }
    case 'reset':
      return initialLiveTurnState
    case 'event': {
      const { event, at = Date.now() } = action
      if (state.status === 'idle' || isTerminal(state)) {
        return state
      }
      const eventRunId = 'run_id' in event ? event.run_id : undefined
      if (eventRunId !== undefined && state.runId !== null && eventRunId !== state.runId) {
        return state
      }
      switch (event.event) {
        case 'flow_started':
          return {
            ...state,
            runId: event.run_id ?? state.runId,
            nodes:
              event.steps !== undefined && event.steps.length > 0
                ? event.steps.map((step): LiveNodeState => ({ id: step.id, label: step.label, status: 'pending' }))
                : state.nodes,
          }
        case 'node_started':
          return { ...state, nodes: upsertNode(state.nodes, event.node, event.label, 'running') }
        case 'node_finished':
          return { ...state, nodes: upsertNode(state.nodes, event.node, event.label, event.outcome) }
        case 'delta': {
          const streaming = { ...state, status: 'streaming' as const }
          if (event.kind === 'reasoning') {
            return { ...streaming, reasoning: (state.reasoning ?? '') + event.text }
          }
          return { ...streaming, text: (state.text ?? '') + event.text }
        }
        case 'tool_call':
          return { ...state, toolCalls: upsertToolCall(state, event) }
        case 'interrupt':
          return { ...state, status: 'interrupted', interruptPayload: event.payload, finishedAt: at }
        case 'flow_finished':
          return { ...state, status: 'done', finishedAt: at }
        case 'flow_failed':
          return {
            ...state,
            status: 'error',
            error: { code: event.code, message: event.message, retryable: event.retryable },
            finishedAt: at,
          }
        case 'flow_interrupted':
          return { ...state, status: 'interrupted', stopped: true, finishedAt: at }
        default:
          return state
      }
    }
    default:
      return state
  }
}
