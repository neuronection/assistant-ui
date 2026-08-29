import { useState } from 'react'
import {
  Combobox,
  ComboboxMulti,
  type ComboboxOption,
} from '../src/components/combobox/Combobox'

const models: ComboboxOption[] = [
  { value: 'gpt', label: 'GPT-5', description: 'OpenAI', group: 'Cloud' },
  { value: 'claude', label: 'Claude Opus', description: 'Anthropic', group: 'Cloud' },
  { value: 'gemini', label: 'Gemini Pro', description: 'Google', group: 'Cloud' },
  { value: 'llama', label: 'Llama 4 70B', description: 'Meta', group: 'Local' },
  { value: 'mistral', label: 'Mistral Large', description: 'Mistral AI', group: 'Local' },
  { value: 'broken', label: 'Unavailable model', disabled: true },
]

export const SingleSelect = () => {
  const [value, setValue] = useState('')
  return (
    <div style={{ maxWidth: 360 }}>
      <Combobox
        options={models}
        value={value}
        onChange={setValue}
        label="Default model"
        clearable
      />
      <p className="text-xs" style={{ marginTop: 8 }}>
        Selected: {value || 'none'}
      </p>
    </div>
  )
}

export const MultiSelect = () => {
  const [value, setValue] = useState<string[]>([])
  return (
    <div style={{ maxWidth: 360 }}>
      <ComboboxMulti
        options={models}
        value={value}
        onChange={setValue}
        label="Fallback models"
      />
      <p className="text-xs" style={{ marginTop: 8 }}>
        Selected: {value.join(', ') || 'none'}
      </p>
    </div>
  )
}

export const AsyncSearch = () => {
  const [value, setValue] = useState('')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const filtered = term ? models.filter((m) => m.label.toLowerCase().includes(term.toLowerCase())) : models
  return (
    <div style={{ maxWidth: 360 }}>
      <Combobox
        options={filtered}
        value={value}
        onChange={setValue}
        label="Search-backed model"
        loading={loading}
        onSearchChange={(next) => {
          setTerm(next)
          setLoading(true)
          window.setTimeout(() => setLoading(false), 600)
        }}
      />
    </div>
  )
}
