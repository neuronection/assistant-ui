import { useState } from 'react'
import { Plus } from 'lucide-react'

import { ChatComposer } from '../src/components/chat-composer/ChatComposer'
import { Button } from '../src/components/button/Button'

function ComposerStory({
  sending,
  onStop,
  initialValue = 'Explain the limit definition, with a diagram',
}: {
  sending?: boolean
  onStop?: () => void
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <div style={{ maxWidth: 520 }}>
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={() => {}}
        sending={sending}
        onStop={onStop}
        toolbarStart={
          <Button variant="ghost" size="sm" aria-label="Attach">
            <Plus className="size-4" />
          </Button>
        }
        suggestions={
          <div style={{ display: 'flex', gap: 6 }}>
            {['Summarize chapter 3', 'Quiz me on derivatives'].map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid var(--as-border)',
                  color: 'var(--as-muted-fg)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        }
      />
    </div>
  )
}

export const Default = () => <ComposerStory />
export const Sending = () => <ComposerStory sending onStop={() => {}} />
export const Multiline = () => (
  <ComposerStory initialValue={'Paste a long text here —\nthe row exposes data-multiline\nonce the textarea grows past one line.'} />
)
