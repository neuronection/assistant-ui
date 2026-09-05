import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
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

export const TwoLevelHeadings = () => {
  const [markdown, setMarkdown] = useState('## Section\n\nBody with a **sub-heading** toolbar.')
  const [ready, setReady] = useState<'no' | 'yes'>('no')
  return (
    <div style={{ maxWidth: 640 }}>
      <RichTextEditor
        value={markdown}
        onValueChange={setMarkdown}
        ariaLabel="Section body"
        headingLevels={[2, 3]}
        labels={{ heading: (level) => `Heading ${level}` }}
        contentClassName="min-h-32"
        onReady={(editor) => setReady(editor === null ? 'no' : 'yes')}
      />
      <p style={{ marginTop: 8, fontSize: 12 }}>editor ready: {ready}</p>
    </div>
  )
}

export const FullExtensionOverride = () => {
  const [markdown, setMarkdown] = useState('Only the extensions the app declares survive.')
  return (
    <div style={{ maxWidth: 640 }}>
      <RichTextEditor
        value={markdown}
        onValueChange={setMarkdown}
        ariaLabel="Override"
        extensions={[StarterKit.configure({ strike: false }), Markdown]}
      />
    </div>
  )
}
