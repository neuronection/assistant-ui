import { useState } from 'react'
import { FileText, ListChecks, Wand2 } from 'lucide-react'
import { AiButton } from '../src/components/ai-button/AiButton'
import {
  AiActionsDropdown,
  type AiAction,
} from '../src/components/ai-actions-dropdown/AiActionsDropdown'

export const AiButtons = () => {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <AiButton
        suggestions={['Why does this match me?', 'What are the downsides?']}
        loading={loading}
        onResponse={answer ? <p style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{answer}</p> : null}
        onSubmit={(prompt) => {
          setLoading(true)
          setTimeout(() => {
            setAnswer(`Echo: ${prompt}`)
            setLoading(false)
          }, 400)
        }}
      />
      <AiButton label="Fill with AI" promptLabel="Describe the medication" onSubmit={() => {}} />
    </div>
  )
}

const actions: AiAction[] = [
  { id: 'summarize', label: 'Summarize', description: 'One-paragraph overview', icon: FileText },
  { id: 'extract', label: 'Extract tasks', description: 'Action items from the note', icon: ListChecks },
  { id: 'rephrase', label: 'Rephrase', icon: Wand2 },
]

export const AiActions = () => {
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <AiActionsDropdown
        actions={actions}
        busy={busy}
        onPrompt={() => setBusy(true)}
        onAction={(action) => {
          setBusy(true)
          setLast(action.label)
          setTimeout(() => setBusy(false), 400)
        }}
      />
      <span style={{ fontSize: 13 }}>{busy ? 'Running…' : last ? `Ran: ${last}` : 'Pick an action'}</span>
    </div>
  )
}
