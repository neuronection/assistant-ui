import { useState } from 'react'
import { Bot, Search } from 'lucide-react'
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
