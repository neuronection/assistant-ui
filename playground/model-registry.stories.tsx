import { useState } from 'react'
import { AudioLines, Database, Eye, FileText, Sparkles, Wrench } from 'lucide-react'
import {
  CapabilityChips,
  type CapabilityDescriptor,
} from '../src/components/capability-chips/CapabilityChips'
import {
  ModelRegistry,
  type ModelRegistryModel,
  type ModelRegistryRemoteModel,
} from '../src/components/model-registry/ModelRegistry'
import type { ModelRegistryProvider } from '../src/components/model-registry/ModelRegistry'

const caps: CapabilityDescriptor[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'vision', label: 'Vision', icon: Eye },
  { value: 'tools', label: 'Tools', icon: Wrench },
  { value: 'embeddings', label: 'Embeddings', icon: Database },
  { value: 'audio', label: 'Audio', icon: AudioLines },
]

const remote: ModelRegistryRemoteModel[] = [
  { id: 'qwen2.5-vl:7b', caps: ['text', 'vision'] },
  { id: 'qwen2.5:7b', caps: ['text', 'tools'] },
  { id: 'nomic-embed-text', caps: ['embeddings'] },
  { id: 'whisper-small', caps: ['audio'] },
  { id: 'tiny-random-merge', caps: [] },
]

const providers: ModelRegistryProvider[] = [
  {
    id: 'ollama',
    name: 'Ollama (local)',
    type: 'openai_compatible',
    baseUrl: 'http://localhost:11434/v1',
  },
]

const models: ModelRegistryModel[] = [
  {
    id: 'm1',
    providerId: 'ollama',
    externalId: 'qwen2.5-vl:7b',
    label: 'Qwen VL',
    caps: ['text', 'vision'],
    enabled: true,
    reasoningEffort: 'medium',
    extra: { description: 'Vision-language model for chart reading.' },
  },
  {
    id: 'm2',
    providerId: 'ollama',
    externalId: 'nomic-embed-text',
    caps: ['embeddings'],
    enabled: true,
  },
]

export const CapabilityChipsStory = () => {
  const [selected, setSelected] = useState<string[]>(['text', 'vision'])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <CapabilityChips
        caps={caps}
        selected={selected}
        onToggle={(value) =>
          setSelected((current) =>
            current.includes(value)
              ? current.filter((entry) => entry !== value)
              : [...current, value],
          )
        }
        ariaLabel="Capabilities"
      />
      <CapabilityChips
        caps={caps}
        selected={selected}
        onToggle={(value) =>
          setSelected((current) =>
            current.includes(value)
              ? current.filter((entry) => entry !== value)
              : [...current, value],
          )
        }
        minSelected={1}
        ariaLabel="Capabilities (min one)"
      />
      <CapabilityChips variant="badge" caps={caps} selected={['text', 'vision']} />
    </div>
  )
}

export const ModelRegistryStory = () => {
  const [expanded, setExpanded] = useState<string | null>('ollama')
  const [registry, setRegistry] = useState(models)
  return (
    <div style={{ maxWidth: 720 }}>
      <ModelRegistry
        providers={providers}
        models={registry}
        caps={caps}
        expandedProviderId={expanded}
        onExpandedProviderChange={setExpanded}
        remoteModels={remote}
        remoteState="ready"
        onAddModel={(_providerId, draft) =>
          setRegistry((current) => [
            ...current,
            {
              id: `new-${current.length}`,
              providerId: 'ollama',
              externalId: draft.externalId,
              label: draft.label,
              caps: draft.caps,
              enabled: true,
              reasoningEffort: draft.reasoningEffort,
              extra: draft.extra,
            },
          ])
        }
        onAddAll={(_providerId, drafts) =>
          setRegistry((current) => [
            ...current,
            ...drafts.map((draft, index) => ({
              id: `bulk-${current.length}-${index}`,
              providerId: 'ollama',
              externalId: draft.externalId,
              caps: draft.caps,
              enabled: false,
            })),
          ])
        }
        onUpdateModel={(model, patch) =>
          setRegistry((current) =>
            current.map((entry) => (entry.id === model.id ? { ...entry, ...patch } : entry)),
          )
        }
        onDeleteModel={(model) =>
          setRegistry((current) => current.filter((entry) => entry.id !== model.id))
        }
        onToggleEnabled={(model, enabled) =>
          setRegistry((current) =>
            current.map((entry) => (entry.id === model.id ? { ...entry, enabled } : entry)),
          )
        }
        extraFields={[
          { key: 'description', label: 'Description', placeholder: 'What is this model used for?', multiline: true },
        ]}
        reasoningEffortOptions={['none', 'low', 'medium', 'high']}
      />
    </div>
  )
}

export const ModelRegistryReadOnlyStory = () => {
  const [expanded, setExpanded] = useState<string | null>('org')
  return (
    <div style={{ maxWidth: 720 }}>
      <ModelRegistry
        providers={[
          { id: 'mine', name: 'My Ollama', type: 'openai_compatible', baseUrl: 'http://localhost:11434/v1' },
          { id: 'org', name: 'Org OpenRouter', type: 'openai_compatible', readOnly: true },
        ]}
        models={[
          { id: 'm1', providerId: 'mine', externalId: 'qwen2.5-vl:7b', label: 'Qwen VL', caps: ['text', 'vision'], enabled: true, reasoningEffort: 'medium' },
          { id: 'm2', providerId: 'org', externalId: 'nomic-embed-text', caps: ['embeddings'], enabled: true },
        ]}
        caps={caps}
        expandedProviderId={expanded}
        onExpandedProviderChange={setExpanded}
        onAddModel={() => {}}
        onUpdateModel={() => {}}
        onDeleteModel={() => {}}
        reasoningEffortOptions={['none', 'low', 'medium', 'high']}
      />
    </div>
  )
}

export const ModelRegistryEmptyStory = () => {
  return (
    <div style={{ maxWidth: 720 }}>
      <ModelRegistry
        providers={[]}
        models={[]}
        caps={caps}
        onExpandedProviderChange={() => {}}
        onAddModel={() => {}}
        onUpdateModel={() => {}}
        onDeleteModel={() => {}}
        emptyAction={
          <button type="button" style={{ padding: '6px 12px' }}>
            <Sparkles style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} size={14} />
            Run setup wizard
          </button>
        }
      />
    </div>
  )
}
