import { useState } from 'react'
import { Bot, Scale, Search } from 'lucide-react'
import {
  ModelPicker,
  type ModelPickerProvider,
} from '../src/components/model-picker/ModelPicker'
import {
  TaskAssignmentPicker,
  type TaskAssignmentTask,
} from '../src/components/task-assignment-picker/TaskAssignmentPicker'

const providers: ModelPickerProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-5', name: 'GPT-5', capability: 'vision' },
      { id: 'gpt-5-mini', name: 'GPT-5 mini' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [{ id: 'claude', name: 'Claude', capability: 'tools' }],
  },
  {
    id: 'local',
    name: 'Ollama (local)',
    models: [{ id: 'llama', name: 'Llama 4' }],
  },
]

export const ModelPickerStory = () => {
  const [model, setModel] = useState('')
  return (
    <div style={{ maxWidth: 380 }}>
      <ModelPicker
        providers={providers}
        value={model}
        onChange={setModel}
        clearable
        label="Model"
      />
    </div>
  )
}

// The labeled null option (plan 29 / ADR-0036): the option list leads with
// the inherit entry; choosing it assigns `null` (= inherit — the app renders
// the resolved default), choosing a model assigns the override. The label is
// app-composed copy, as everywhere (no i18n in the library).
export const ModelPickerNullOptionStory = () => {
  const [model, setModel] = useState<string | null>(null)
  return (
    <div style={{ maxWidth: 380, display: 'grid', gap: 8 }}>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        {model === null
          ? 'Inherits — Jev (latest) serves every decision kind'
          : `Override: ${model}`}
      </p>
      <ModelPicker
        providers={providers}
        value={model ?? ''}
        nullOption={{ label: 'Inherits — Jev (latest)' }}
        onChange={setModel}
        clearable={false}
        label="Decision model"
      />
    </div>
  )
}

const tasks: TaskAssignmentTask[] = [
  { id: 'summarize', label: 'Summarize documents', description: 'Daily digests' },
  { id: 'chat', label: 'Chat' },
  { id: 'extract', label: 'Extract structured data' },
]

export const TaskAssignmentStory = () => {
  const [value, setValue] = useState<Record<string, string | null>>({
    summarize: 'gpt-5',
    chat: null,
    extract: null,
  })
  return (
    <TaskAssignmentPicker
      tasks={tasks}
      providers={providers}
      value={value}
      onAssign={(taskId, modelId) =>
        setValue((current) => ({ ...current, [taskId]: modelId }))
      }
    />
  )
}

const localProviders: ModelPickerProvider[] = [
  {
    id: 'local',
    name: 'Ollama (local)',
    models: [
      { id: 'qwen-vl', name: 'Qwen 2.5 VL', capabilities: ['text', 'vision'] },
      { id: 'nomic', name: 'Nomic Embed', capabilities: ['embeddings'] },
      { id: 'llama', name: 'Llama 4', capabilities: ['text', 'tools'] },
    ],
  },
]

export const TaskAssignmentFallbackOnlyStory = () => {
  const [secondary, setSecondary] = useState<Record<string, string | null>>({
    default: 'llama',
  })
  return (
    <div style={{ maxWidth: 720, display: 'grid', gap: 16 }}>
      <TaskAssignmentPicker
        tasks={[]}
        sections={[
          {
            id: 'fallback',
            label: 'Global fallback',
            description: 'Serves every task without its own assignment.',
            tasks: [{ id: 'default', label: 'Global default model', secondaryOnly: true }],
          },
          {
            id: 'tasks',
            label: 'Tasks',
            tasks: [{ id: 'ocr', label: 'Page OCR', requires: 'vision', icon: Search }],
          },
        ]}
        providers={localProviders}
        value={{ ocr: null }}
        secondaryValue={secondary}
        onAssign={() => {}}
        onAssignSecondary={(taskId, modelId) =>
          setSecondary((current) => ({ ...current, [taskId]: modelId }))
        }
      />
    </div>
  )
}

export const TaskAssignmentV2Story = () => {
  const [value, setValue] = useState<Record<string, string | null>>({
    text: 'llama',
    ocr: null,
    embed: null,
  })
  const [secondary, setSecondary] = useState<Record<string, string | null>>({
    text: null,
  })
  return (
    <TaskAssignmentPicker
      tasks={[]}
      sections={[
        {
          id: 'defaults',
          label: 'Default models',
          secondary: true,
          tasks: [
            { id: 'text', label: 'Default text model', requires: 'text', icon: Bot },
          ],
        },
        {
          id: 'tasks',
          label: 'Tasks',
          tasks: [
            { id: 'ocr', label: 'Page OCR', requires: 'vision', icon: Search },
            { id: 'embed', label: 'Embeddings', requires: 'embeddings' },
          ],
        },
      ]}
      providers={localProviders}
      value={value}
      secondaryValue={secondary}
      onAssign={(taskId, modelId) =>
        setValue((current) => ({ ...current, [taskId]: modelId }))
      }
      onAssignSecondary={(taskId, modelId) =>
        setSecondary((current) => ({ ...current, [taskId]: modelId }))
      }
      secondaryLabel="Fallback model"
      renderMeta={(task) =>
        task.id === 'text' ? (
          <span style={{ fontSize: 11, opacity: 0.7 }}>Used when a task has no override</span>
        ) : undefined
      }
    />
  )
}

// Decision models group (plan 26 / ADR-0032): `decision:<capability>` slots
// with primary + fallback. `requires: 'decision'` filters every picker to
// decision-capable models only — the text models below never appear in a
// decision slot, and the decision models never satisfy the text default.
// App copy (labels, privacy notice) is prop-injected, as everywhere.
const decisionProviders: ModelPickerProvider[] = [
  {
    id: 'typesafe',
    name: 'TypeSafe',
    models: [{ id: 'jev-latest', name: 'Jev (latest)', capabilities: ['decision'] }],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'openrouter/auto', name: 'Auto (best match)', capabilities: ['text', 'tools'] },
      { id: 'openrouter.jev-latest', name: 'Jev via OpenRouter', capabilities: ['decision'] },
    ],
  },
]

const decisionSections = [
  {
    id: 'decision',
    label: 'Decision models',
    description: 'Cloud decision models are opt-in; prompts and candidate tool data leave the device.',
    secondary: true,
    tasks: [
      { id: 'decision:tool-dispatch', label: 'Tool dispatch', requires: 'decision', icon: Scale },
      { id: 'decision:boolean-gate', label: 'Boolean gate', requires: 'decision', icon: Scale },
      { id: 'decision:choice', label: 'Choice', requires: 'decision', icon: Scale },
      { id: 'decision:score', label: 'Score', requires: 'decision', icon: Scale },
    ],
  },
  {
    id: 'defaults',
    label: 'Default models',
    secondary: true,
    tasks: [{ id: 'text', label: 'Default text model', requires: 'text', icon: Bot }],
  },
]

export const TaskAssignmentDecisionStory = () => {
  const [value, setValue] = useState<Record<string, string | null>>({
    'decision:tool-dispatch': 'jev-latest',
    'decision:boolean-gate': null,
    'decision:choice': null,
    'decision:score': null,
    text: 'openrouter/auto',
  })
  const [secondary, setSecondary] = useState<Record<string, string | null>>({
    'decision:tool-dispatch': 'openrouter.jev-latest',
  })
  return (
    <TaskAssignmentPicker
      tasks={[]}
      sections={decisionSections}
      providers={decisionProviders}
      value={value}
      secondaryValue={secondary}
      onAssign={(taskId, modelId) =>
        setValue((current) => ({ ...current, [taskId]: modelId }))
      }
      onAssignSecondary={(taskId, modelId) =>
        setSecondary((current) => ({ ...current, [taskId]: modelId }))
      }
      secondaryLabel="Fallback"
      renderMeta={(task) =>
        task.id === 'text' ? (
          <span style={{ fontSize: 11, opacity: 0.7 }}>Decision models never satisfy this slot</span>
        ) : undefined
      }
    />
  )
}
