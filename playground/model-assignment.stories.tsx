import { useState } from 'react'
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
