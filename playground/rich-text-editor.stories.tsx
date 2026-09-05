import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { RichTextEditor } from '../src/components/rich-text-editor/RichTextEditor'

export const Default = () => {
  const [markdown, setMarkdown] = useState('# Release notes\n\nWrite something **bold**.')
  return (
    <div style={{ maxWidth: 640 }}>
      <RichTextEditor value={markdown} onValueChange={setMarkdown} ariaLabel="Document" />
      <pre
        style={{
          marginTop: 12,
          fontSize: 12,
          background: 'var(--as-subtle, #f5f5f5)',
          padding: 8,
          whiteSpace: 'pre-wrap',
        }}
      >
        {markdown}
      </pre>
    </div>
  )
}

export const MinimalToolbar = () => {
  const [markdown, setMarkdown] = useState('Only *format* and lists.')
  return (
    <div style={{ maxWidth: 480 }}>
      <RichTextEditor
        value={markdown}
        onValueChange={setMarkdown}
        ariaLabel="Comment"
        toolbar={['format', 'list']}
      />
    </div>
  )
}

export const WithAppSlot = () => {
  const [markdown, setMarkdown] = useState('Summary line with an app-owned assist button.')
  return (
    <div style={{ maxWidth: 640 }}>
      <RichTextEditor
        value={markdown}
        onValueChange={setMarkdown}
        ariaLabel="Summary"
        toolbar={['history', 'format']}
        toolbarExtra={
          <button
            type="button"
            title="Assist (app-owned)"
            style={{ marginLeft: 'auto' }}
            className="rounded p-1.5"
          >
            <Sparkles className="size-4" aria-hidden />
          </button>
        }
      />
    </div>
  )
}

export const Disabled = () => {
  return (
    <div style={{ maxWidth: 640 }}>
      <RichTextEditor value="Read-only content" onValueChange={() => {}} ariaLabel="Report" disabled />
    </div>
  )
}
