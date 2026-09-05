import { useState } from 'react'
import { DictationButton, DictationStrip, useDictation } from '../src/components/dictation'
import {
  useAiTextTransform,
  type AiTextTransformTransport,
} from '../src/components/ai-text-transform'
import { FlowStatusCard } from '../src/components/flow-status/FlowStatusCard'

function DictationDemo() {
  const [text, setText] = useState('')
  const dictation = useDictation({
    transcribe: async () => {
      await new Promise((resolve) => setTimeout(resolve, 900))
      return { text: 'This is where the app adapter calls its gateway.' }
    },
    onResult: setText,
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DictationButton
          status={dictation.status}
          onStart={() => void dictation.start()}
          label="Dictate"
        />
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Transcribed text"
          style={{ flex: 1 }}
        />
      </div>
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

export const Dictation = () => <DictationDemo />

const fakeTransport: AiTextTransformTransport = {
  start: async () => 'demo',
  subscribe: (_jobId, handlers) => {
    const words = ['The ', 'transform ', 'streams ', 'through ', 'the ', 'app ', 'transport.']
    words.forEach((word, index) => {
      setTimeout(() => handlers.onDelta(word), 150 * (index + 1))
    })
    setTimeout(() => handlers.onDone(words.join('')), 150 * words.length + 200)
    return () => undefined
  },
  cancel: async () => undefined,
}

function TransformDemo() {
  const transform = useAiTextTransform({ transport: fakeTransport })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <button
        type="button"
        onClick={() => void transform.start()}
        disabled={transform.status === 'running'}
      >
        Run transform
      </button>
      <FlowStatusCard
        title="AI transform"
        steps={[
          {
            id: 'transform',
            label: 'Transform',
            status: transform.status === 'running' ? 'running' : 'done',
          },
        ]}
        status={
          transform.status === 'running'
            ? 'running'
            : transform.status === 'error'
              ? 'failed'
              : 'done'
        }
      />
      <div style={{ fontSize: 13 }}>{transform.result}</div>
    </div>
  )
}

export const AiTextTransform = () => <TransformDemo />
