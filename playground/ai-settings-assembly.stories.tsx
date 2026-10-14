import { useState } from 'react'
import {
  ProviderSetupTiles,
  ProviderSetupManualTile,
  type ProviderSetupTileData,
} from '../src/components/provider-setup-tiles/ProviderSetupTiles'
import {
  ProviderSetupForm,
  type ProviderSetupFormValue,
} from '../src/components/provider-setup-form/ProviderSetupForm'
import {
  SetupReview,
  type SetupReviewOptions,
} from '../src/components/setup-review/SetupReview'
import { SetupFirstRunCard } from '../src/components/setup-first-run-card/SetupFirstRunCard'
import { SetupSteps } from '../src/components/setup-steps/SetupSteps'
import {
  SetupAssignments,
  type SetupAssignmentRow,
} from '../src/components/setup-assignments/SetupAssignments'
import {
  ProviderCard,
  type ProviderCardAction,
} from '../src/components/provider-card/ProviderCard'
import { SwitchRow } from '../src/components/switch-row/SwitchRow'
import { ProviderLogo } from '../src/components/provider-logo/ProviderLogo'
import {
  TaskAssignmentPicker,
  type TaskAssignmentSection,
} from '../src/components/task-assignment-picker/TaskAssignmentPicker'
import type { ModelPickerProvider } from '../src/components/model-picker/ModelPicker'

const presets: ProviderSetupTileData[] = [
  {
    key: 'openai',
    name: 'OpenAI',
    chips: [
      { key: 'chat', label: 'Chat' },
      { key: 'vision', label: 'Vision' },
    ],
  },
  { key: 'gemini', name: 'Google AI Studio' },
  {
    key: 'openrouter',
    name: 'OpenRouter',
    chips: [
      { key: 'chat', label: 'Chat' },
      { key: 'decision', label: 'Decision' },
    ],
  },
  {
    key: 'typesafe',
    name: 'TypeSafe',
    chips: [{ key: 'decision', label: 'Decision' }],
  },
  { key: 'anthropic', name: 'Anthropic' },
  { key: 'groq', name: 'Groq' },
  { key: 'mistral', name: 'Mistral AI' },
  { key: 'deepseek', name: 'DeepSeek' },
  {
    key: 'ollama',
    name: 'Ollama',
    chips: [
      { key: 'chat', label: 'Chat' },
      { key: 'local', label: 'Local' },
      { key: 'decision', label: 'Decision' },
    ],
  },
]

export const AiSettingsFirstRunStory = () => {
  const [dismissed, setDismissed] = useState(false)
  const [probing, setProbing] = useState(true)
  if (dismissed) return <p>Card dismissed.</p>
  return (
    <div style={{ maxWidth: 460 }}>
      <SetupFirstRunCard
        title="Connect an AI provider"
        body="Bring your own key — it stays on this device. Set up takes under a minute."
        localProbing={probing}
        onSetup={() => setProbing(false)}
        onDismiss={() => setDismissed(true)}
      />
    </div>
  )
}

export const AiSettingsSetupTilesStory = () => {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div style={{ maxWidth: 640 }}>
      <ProviderSetupTiles
        presets={presets}
        configured={['openai']}
        suggestedKey="gemini"
        onSelect={setSelected}
      >
        <ProviderSetupManualTile onClick={() => setSelected('custom')}>
          Manual setup
        </ProviderSetupManualTile>
      </ProviderSetupTiles>
      <p style={{ marginTop: 8, fontSize: 12 }}>selected: {selected ?? '—'}</p>
    </div>
  )
}

export const AiSettingsSetupFormStory = () => {
  const [value, setValue] = useState<ProviderSetupFormValue>({
    name: 'OpenAI',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
  })
  const [error, setError] = useState<{ code: string; suspectedVendor?: string } | null>(null)
  return (
    <div style={{ maxWidth: 460 }}>
      <ProviderSetupForm
        preset={{
          name: 'OpenAI',
          keyUrl: 'https://platform.openai.com/api-keys',
          steps: ['Open {url}', 'Create a key', 'Paste it below'],
          freeTierNote: 'Pay-as-you-go; new accounts include trial credit.',
          fixedBase: false,
          baseUrl: 'https://api.openai.com/v1',
        }}
        value={value}
        onChange={setValue}
        error={error}
        onSubmit={() => setError({ code: 'invalid_key', suspectedVendor: 'openrouter' })}
        onCancel={() => setError(null)}
      />
    </div>
  )
}

const reviewModels = [
  { id: 'jev-latest', name: 'jev-latest', caps: ['decision'], selected: true },
  { id: 'openrouter.jev-latest', name: 'openrouter.jev-latest', caps: ['decision'], selected: false },
]

export const AiSettingsReviewStory = () => {
  const [options, setOptions] = useState<SetupReviewOptions>({
    curatedIds: ['jev-latest'],
    bindChat: true,
    bindVision: true,
    bindStt: false,
    bindDecision: true,
  })
  return (
    <div style={{ maxWidth: 560 }}>
      <SetupReview
        models={reviewModels.map((model) => ({
          ...model,
          selected: options.curatedIds.includes(model.id),
        }))}
        slots={[
          {
            id: 'decision',
            label: 'Fill empty decision slots',
            bind: options.bindDecision,
            currentValue: 'tool dispatch · boolean gate · choice · score',
            optionsKey: 'bindDecision',
          },
        ]}
        onOptionsChange={setOptions}
      />
      <p style={{ marginTop: 8, fontSize: 12 }}>{JSON.stringify(options)}</p>
    </div>
  )
}

export const AiSettingsSetupStepsStory = () => (
  <div style={{ maxWidth: 460, display: 'grid', gap: 16 }}>
    <SetupSteps
      steps={[
        { id: 'connect', label: 'Connect provider' },
        { id: 'defaults', label: 'Choose defaults' },
      ]}
      current={0}
    />
    <SetupSteps
      steps={[
        { id: 'connect', label: 'Connect provider' },
        { id: 'defaults', label: 'Choose defaults' },
      ]}
      current={1}
    />
    <SetupSteps
      steps={[
        { id: 'connect', label: 'Connect provider' },
        { id: 'defaults', label: 'Choose defaults' },
      ]}
      current={2}
    />
  </div>
)

const assignmentRows: Array<Omit<SetupAssignmentRow, 'onCheckedChange'>> = [
  {
    id: 'chat',
    label: 'Chat default',
    hint: 'now: unset · fills: openrouter/auto',
    checked: true,
  },
  {
    id: 'vision',
    label: 'Vision default',
    hint: 'no model selected',
    checked: false,
    disabled: true,
  },
  {
    id: 'decision',
    label: 'Default decision model',
    hint: 'now: unset · fills: Jev 1.13 via OpenRouter (pinned)',
    checked: true,
  },
]

export const AiSettingsSetupAssignmentsStory = () => {
  const [rows, setRows] = useState(assignmentRows)
  const flip = (id: string) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id && !row.disabled
          ? { ...row, checked: !row.checked }
          : row,
      ),
    )
  return (
    <SetupAssignments
      title="Default assignments"
      hint="Each switch fills that empty default with the shown model — existing assignments are never touched."
      rows={rows.map((row) => ({
        ...row,
        onCheckedChange: () => flip(row.id),
      }))}
    />
  )
}

export const AiSettingsProviderCardStory = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [error, setError] = useState<string | null>(null)
  const runTest = () => {
    setStatus('testing')
    setTimeout(() => {
      const ok = Math.random() > 0.4
      setStatus(ok ? 'ok' : 'fail')
      setError(ok ? null : '401 — check the key and try again')
    }, 800)
  }
  const actions: ProviderCardAction[] = [
    { key: 'setup', label: 'Set up automatically', onSelect: () => {} },
    { key: 'edit', label: 'Edit', onSelect: () => {} },
    { key: 'test', label: 'Test connection', disabled: status === 'testing', onSelect: runTest },
    { key: 'delete', label: 'Delete', danger: true, onSelect: () => {} },
  ]
  return (
    <div style={{ maxWidth: 560, display: 'grid', gap: 12 }}>
      <ProviderCard
        name="OpenAI"
        logoPreset="openai"
        nameTitle="https://api.openai.com/v1"
        badges={[
          { key: 'type', label: 'openai' },
          { key: 'hosting', label: 'Cloud' },
          { key: 'key', label: '🔑', title: 'API key configured' },
        ]}
        status={status}
        errorMessage={error}
        meta="4 models"
        okLabel="Connected"
        failLabel="Failed"
        actions={actions}
        actionsLabel="Actions for OpenAI"
      />
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        The connection string lives on the name tooltip; Test lives in the ⋯ menu.
      </p>
    </div>
  )
}

export const AiSettingsSwitchRowStory = () => {
  const [chat, setChat] = useState(true)
  const [vision, setVision] = useState(false)
  return (
    <div style={{ maxWidth: 420, display: 'grid', gap: 8 }}>
      <SwitchRow
        label="Fill default text model"
        currentValue="now: gpt-5.6-terra"
        checked={chat}
        onCheckedChange={setChat}
      />
      <SwitchRow
        label="Fill default vision model"
        currentValue="now: unset"
        checked={vision}
        onCheckedChange={setVision}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>Marks:</span>
        {['openai', 'gemini', 'openrouter', 'anthropic', 'groq', 'mistral', 'deepseek', 'ollama'].map(
          (preset) => (
            <ProviderLogo key={preset} preset={preset} />
          ),
        )}
      </div>
    </div>
  )
}

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

const decisionSections: TaskAssignmentSection[] = [
  {
    id: 'decision',
    label: 'Decision models',
    description: 'Cloud decision models are opt-in.',
    secondary: true,
    tasks: [
      { id: 'decision:tool-dispatch', label: 'Tool dispatch', requires: 'decision' },
      { id: 'decision:boolean-gate', label: 'Boolean gate', requires: 'decision' },
      { id: 'decision:choice', label: 'Choice', requires: 'decision' },
      { id: 'decision:score', label: 'Score', requires: 'decision' },
    ],
  },
  {
    id: 'defaults',
    label: 'Default models',
    secondary: true,
    tasks: [{ id: 'text', label: 'Default text model', requires: 'text' }],
  },
]

export const AiSettingsDecisionAssignmentStory = () => {
  const [value, setValue] = useState<Record<string, string | null>>({
    'decision:tool-dispatch': 'jev-latest',
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
      onAssign={(taskId, modelId) => setValue((v) => ({ ...v, [taskId]: modelId }))}
      onAssignSecondary={(taskId, modelId) => setSecondary((v) => ({ ...v, [taskId]: modelId }))}
    />
  )
}
