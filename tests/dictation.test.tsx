import { describe, expect, it, vi, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  DictationButton,
  DictationStrip,
  useDictation,
} from '../src/components/dictation'

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = []
  state = 'inactive'
  mimeType = 'audio/webm;codecs=opus'
  ondataavailable: ((event: { data: { size: number } }) => void) | null = null
  onstop: (() => void) | null = null
  constructor() {
    FakeMediaRecorder.instances.push(this)
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.onstop?.()
  }
  isTypeSupported() {
    return true
  }
  static isTypeSupported() {
    return true
  }
}

const fakeStream = { getTracks: () => [{ stop: () => undefined }] }

function installMedia(): void {
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  FakeMediaRecorder.instances = []
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => fakeStream },
  })
}

function uninstallMedia(): void {
  vi.unstubAllGlobals()
  delete (navigator as { mediaDevices?: unknown }).mediaDevices
}

interface Probe {
  status: string
  seconds: number
  error: { kind: string } | null
  levelRef: { current: number }
  start: () => Promise<void>
  stop: () => Promise<void>
  cancel: () => void
  dismissError: () => void
}

function Probe({
  transport,
  classifyError,
  onResult,
  capture,
}: {
  transport: { transcribe: (audio: Blob) => Promise<{ text: string }> }
  classifyError?: (error: unknown) => { kind: 'unassigned' }
  onResult?: (text: string) => void
  capture: { current: Probe | null }
}) {
  const dictation = useDictation({ transcribe: transport.transcribe, classifyError, onResult })
  capture.current = dictation as unknown as Probe
  return (
    <div>
      <DictationButton status={dictation.status} onStart={() => void dictation.start()} />
      <DictationStrip
        status={dictation.status}
        seconds={dictation.seconds}
        levelRef={dictation.levelRef}
        error={dictation.error}
        onStop={() => void dictation.stop()}
        onCancel={dictation.cancel}
        onDismissError={dictation.dismissError}
      />
    </div>
  )
}

describe('DictationButton', () => {
  it('renders a labelled mic toggle', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<DictationButton status="idle" onStart={onStart} label="Dictate" />)
    const button = screen.getByRole('button', { name: 'Dictate' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('is disabled while transcribing', () => {
    render(<DictationButton status="transcribing" onStart={() => {}} label="Dictate" />)
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeDisabled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <DictationButton status="recording" onStart={() => {}} label="Dictate" />,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('DictationStrip', () => {
  it('renders nothing when idle', () => {
    const { container } = render(
      <DictationStrip
        status="idle"
        seconds={0}
        levelRef={{ current: 0 }}
        error={null}
        onStop={() => {}}
        onCancel={() => {}}
        onDismissError={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the recording state with stop and cancel', async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    const onCancel = vi.fn()
    render(
      <DictationStrip
        status="recording"
        seconds={65}
        levelRef={{ current: 0 }}
        error={null}
        labels={{ stop: 'Finish', cancel: 'Discard' }}
        onStop={onStop}
        onCancel={onCancel}
        onDismissError={() => {}}
      />,
    )
    expect(screen.getByRole('status', { name: 'Recording…' })).toBeInTheDocument()
    expect(screen.getByText('01:05')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows the transcribing state', () => {
    render(
      <DictationStrip
        status="transcribing"
        seconds={0}
        levelRef={{ current: 0 }}
        error={null}
        onStop={() => {}}
        onCancel={() => {}}
        onDismissError={() => {}}
      />,
    )
    expect(screen.getByText('Transcribing…')).toBeInTheDocument()
  })

  it('renders structured errors as an alert with a dismiss control', async () => {
    const user = userEvent.setup()
    const onDismissError = vi.fn()
    render(
      <DictationStrip
        status="idle"
        seconds={0}
        levelRef={{ current: 0 }}
        error={{ kind: 'failed', detail: 'model exploded' }}
        onStop={() => {}}
        onCancel={() => {}}
        onDismissError={onDismissError}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Transcription failed. model exploded',
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismissError).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations (recording and error states)', async () => {
    const recording = render(
      <DictationStrip
        status="recording"
        seconds={3}
        levelRef={{ current: 0 }}
        error={null}
        onStop={() => {}}
        onCancel={() => {}}
        onDismissError={() => {}}
      />,
    )
    expect((await axe(recording.container)).violations).toEqual([])
    recording.unmount()
    const failure = render(
      <DictationStrip
        status="idle"
        seconds={0}
        levelRef={{ current: 0 }}
        error={{ kind: 'denied' }}
        onStop={() => {}}
        onCancel={() => {}}
        onDismissError={() => {}}
      />,
    )
    expect((await axe(failure.container)).violations).toEqual([])
  })
})

describe('useDictation', () => {
  afterEach(() => {
    uninstallMedia()
  })

  it('reports unsupported when MediaRecorder is unavailable', async () => {
    const capture = { current: null as Probe | null }
    render(<Probe transport={{ transcribe: async () => ({ text: '' }) }} capture={capture} />)
    await screen.findByRole('button', { name: 'Dictate' })
    await capture.current?.start()
    await waitFor(() => expect(capture.current?.error?.kind).toBe('unsupported'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Speech input is not supported in this browser.',
    )
  })

  it('records, then stops through the transport and delivers the result', async () => {
    installMedia()
    const onResult = vi.fn()
    const transcribe = vi.fn(async () => ({ text: 'hello world' }))
    const capture = { current: null as Probe | null }
    render(
      <Probe transport={{ transcribe }} onResult={onResult} capture={capture} />,
    )
    await screen.findByRole('button', { name: 'Dictate' })
    await capture.current?.start()
    await waitFor(() => expect(capture.current?.status).toBe('recording'))
    expect(screen.getByRole('status')).toBeInTheDocument()
    await capture.current?.stop()
    await waitFor(() => expect(capture.current?.status).toBe('idle'))
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(onResult).toHaveBeenCalledWith('hello world')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('classifies transport failures via the injected classifier', async () => {
    installMedia()
    const capture = { current: null as Probe | null }
    render(
      <Probe
        transport={{
          transcribe: async () => {
            throw new Error('gateway down')
          },
        }}
        classifyError={() => ({ kind: 'unassigned' })}
        capture={capture}
      />,
    )
    await screen.findByRole('button', { name: 'Dictate' })
    await capture.current?.start()
    await waitFor(() => expect(capture.current?.status).toBe('recording'))
    await capture.current?.stop()
    await waitFor(() => expect(capture.current?.error?.kind).toBe('unassigned'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No speech-to-text model is assigned.',
    )
  })

  it('cancel returns to idle without calling the transport', async () => {
    installMedia()
    const transcribe = vi.fn(async () => ({ text: '' }))
    const capture = { current: null as Probe | null }
    render(<Probe transport={{ transcribe }} capture={capture} />)
    await screen.findByRole('button', { name: 'Dictate' })
    await capture.current?.start()
    await waitFor(() => expect(capture.current?.status).toBe('recording'))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(capture.current?.status).toBe('idle'))
    expect(capture.current?.error).toBeNull()
  })
})
