import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { FormModal } from '../form-modal/FormModal'
import { Textarea } from '../input/Textarea'

export interface AiMagicFillProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string) => void
  busy?: boolean
  error?: string | null
  title?: string
  subtitle?: string
  description?: string
  promptLabel?: string
  placeholder?: string
  submitLabel?: string
  cancelLabel?: string
  className?: string
}

export function AiMagicFill({
  open,
  onOpenChange,
  onSubmit,
  busy = false,
  error,
  title = 'Magic Fill',
  subtitle = 'AI-powered data extraction',
  description,
  promptLabel = 'Describe details',
  placeholder = 'Describe the data here…',
  submitLabel,
  cancelLabel = 'Cancel',
  className,
}: AiMagicFillProps) {
  const [prompt, setPrompt] = React.useState('')

  const submit = () => {
    const trimmed = prompt.trim()
    if (!trimmed || busy) return
    onSubmit(trimmed)
    setPrompt('')
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={subtitle}
      icon={Sparkles}
      submitLabel={submitLabel ?? `Apply ${title}`}
      cancelLabel={cancelLabel}
      submitting={busy}
      submitDisabled={!prompt.trim()}
      onSubmit={submit}
      contentClassName={className}
    >
      <div data-as="ai-magic-fill" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ai-magic-fill-prompt"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--as-muted-fg)]"
          >
            {promptLabel}
          </label>
          <Textarea
            id="ai-magic-fill-prompt"
            rows={5}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={placeholder}
            className="resize-none leading-relaxed"
          />
        </div>
        {description ? (
          <p className="rounded-[var(--as-radius)] border border-[color-mix(in_srgb,var(--as-ai)_25%,transparent)] bg-[color-mix(in_srgb,var(--as-ai)_8%,transparent)] p-3 text-xs font-medium leading-relaxed text-[var(--as-fg)]">
            {description}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-xs font-semibold text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    </FormModal>
  )
}
