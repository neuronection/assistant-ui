import * as React from 'react'
import { Loader2, Mic, Square, X } from 'lucide-react'

import { cn } from '../../lib/utils'

import type { DictationError, DictationStatus } from './useDictation'

const BAR_WEIGHTS = [0.45, 0.62, 0.8, 0.92, 1.05]

export interface DictationButtonProps {
  status: DictationStatus
  onStart: () => void
  /** Accessible name / tooltip. English default: 'Dictate'. */
  label?: string
  recordingLabel?: string
  className?: string
}

export function DictationButton({
  status,
  onStart,
  label = 'Dictate',
  recordingLabel,
  className,
}: DictationButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={status === 'recording' ? true : status === 'transcribing' ? undefined : false}
      disabled={status === 'transcribing'}
      data-as="dictation-button"
      className={cn(
        'rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)]',
        status === 'recording'
          ? 'animate-pulse bg-[var(--as-danger)]/10 text-[var(--as-danger)]'
          : 'text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]',
        className,
      )}
      onClick={onStart}
    >
      <Mic className="size-4" aria-hidden />
      <span className="sr-only">{recordingLabel ?? label}</span>
    </button>
  )
}

function LevelBars({
  levelRef,
  active,
}: {
  levelRef: React.RefObject<number>
  active: boolean
}) {
  const barsRef = React.useRef<Array<HTMLSpanElement | null>>([])
  React.useEffect(() => {
    if (!active) {
      return
    }
    let frame = requestAnimationFrame(function tick() {
      const level = Math.min(1, levelRef.current ?? 0)
      barsRef.current.forEach((bar, index) => {
        if (bar !== null) {
          const weight = BAR_WEIGHTS[index] ?? 1
          const height = Math.max(0.15, Math.min(1, level * weight))
          bar.style.transform = `scaleY(${height})`
        }
      })
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [active, levelRef])
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {BAR_WEIGHTS.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            barsRef.current[index] = element
          }}
          className="h-4 w-1 origin-bottom rounded-full bg-[var(--as-danger)] opacity-40"
        />
      ))}
    </span>
  )
}

export interface DictationStripLabels {
  recording?: string
  transcribing?: string
  stop?: string
  cancel?: string
  dismissError?: string
  unsupported?: string
  denied?: string
  unassigned?: string
  /** `{detail}` is interpolated with the transport error message. */
  failed?: string
}

const DEFAULT_STRIP_LABELS: Required<DictationStripLabels> = {
  recording: 'Recording…',
  transcribing: 'Transcribing…',
  stop: 'Stop',
  cancel: 'Cancel',
  dismissError: 'Dismiss',
  unsupported: 'Speech input is not supported in this browser.',
  denied: 'Microphone access was denied.',
  unassigned: 'No speech-to-text model is assigned.',
  failed: 'Transcription failed. {detail}',
}

export interface DictationStripProps {
  status: DictationStatus
  seconds: number
  levelRef: React.RefObject<number>
  error: DictationError | null
  labels?: Partial<DictationStripLabels>
  onStop: () => void
  onCancel: () => void
  onDismissError: () => void
  className?: string
}

export function DictationStrip({
  status,
  seconds,
  levelRef,
  error,
  labels,
  onStop,
  onCancel,
  onDismissError,
  className,
}: DictationStripProps) {
  const merged = { ...DEFAULT_STRIP_LABELS, ...labels }
  const formatTime = (total: number) => {
    const minutes = Math.floor(total / 60)
    const padded = String(total % 60).padStart(2, '0')
    return `${String(minutes).padStart(2, '0')}:${padded}`
  }
  const errorText =
    error === null
      ? ''
      : error.kind === 'unsupported'
        ? merged.unsupported
        : error.kind === 'denied'
          ? merged.denied
          : error.kind === 'unassigned'
            ? merged.unassigned
            : merged.failed.replace('{detail}', error.detail ?? '')
  if (error !== null) {
    return (
      <div
        data-as="dictation-strip"
        className={cn(
          'flex items-center gap-2 rounded-md border border-dashed border-[var(--as-warning)] px-2.5 py-1.5 text-xs text-[var(--as-warning)]',
          className,
        )}
        role="alert"
      >
        <span className="min-w-0 flex-1 break-words">{errorText}</span>
        <button
          type="button"
          aria-label={merged.dismissError}
          title={merged.dismissError}
          className="rounded-full p-0.5 hover:opacity-70"
          onClick={onDismissError}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    )
  }
  if (status === 'idle') {
    return null
  }
  return (
    <div
      data-as="dictation-strip"
      className={cn(
        'flex items-center gap-2 rounded-md border border-[var(--as-border)] bg-[var(--as-surface)] px-2.5 py-1.5 text-xs',
        className,
      )}
      role="status"
      aria-label={merged.recording}
    >
      {status === 'recording' ? (
        <>
          <span
            className="size-2 shrink-0 animate-pulse rounded-full bg-[var(--as-danger)]"
            aria-hidden
          />
          <span className="tabular-nums font-medium text-[var(--as-fg)]">
            {formatTime(seconds)}
          </span>
          <LevelBars levelRef={levelRef} active />
          <span className="min-w-0 flex-1 truncate text-[var(--as-muted-fg)]">
            {merged.recording}
          </span>
          <button
            type="button"
            aria-label={merged.cancel}
            title={merged.cancel}
            className="rounded p-1 text-[var(--as-muted-fg)] hover:text-[var(--as-fg)]"
            onClick={onCancel}
          >
            <X className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            title={merged.stop}
            aria-label={merged.stop}
            className="flex items-center gap-1 rounded bg-[var(--as-danger)] px-2 py-1 font-medium"
            onClick={onStop}
          >
            <Square className="size-3" aria-hidden />
            {merged.stop}
          </button>
        </>
      ) : (
        <>
          <Loader2
            className="size-3.5 shrink-0 animate-spin text-[var(--as-muted-fg)]"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-[var(--as-muted-fg)]">
            {merged.transcribing}
          </span>
        </>
      )}
    </div>
  )
}
