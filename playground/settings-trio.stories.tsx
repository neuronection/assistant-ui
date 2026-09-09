import { useState } from 'react'
import { Cpu, KeyRound, ListChecks, Server } from 'lucide-react'
import {
  SettingsShell,
  type SettingsNavItem,
} from '../src/components/settings-shell/SettingsShell'
import { ProviderForm } from '../src/components/provider-form/ProviderForm'
import {
  ConnectionTestRow,
  type ConnectionTestStatus,
} from '../src/components/connection-test-row/ConnectionTestRow'

const nav: SettingsNavItem[] = [
  { id: 'providers', label: 'Providers', description: 'AI endpoints', icon: Server },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
]

export const SettingsShellStory = () => {
  const [active, setActive] = useState('providers')
  return (
    <SettingsShell
      nav={nav}
      active={active}
      onNavigate={setActive}
      header={{ icon: KeyRound, title: 'Settings' }}
    >
      <p style={{ fontSize: 14 }}>Section: {active}</p>
    </SettingsShell>
  )
}

export const ProviderFormStory = () => {
  const [name, setName] = useState('OpenRouter')
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/v1')
  const [apiKey, setApiKey] = useState('')
  return (
    <div style={{ maxWidth: 420 }}>
      <ProviderForm
        name={name}
        onNameChange={setName}
        baseUrl={baseUrl}
        onBaseUrlChange={setBaseUrl}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        apiKeyHelp="Stored in the system keyring — never rendered back"
        hasStoredKey
      />
    </div>
  )
}

export const ProviderFormPresetsStory = () => {
  const [presetKey, setPresetKey] = useState('openai')
  const [name, setName] = useState('OpenAI')
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1')
  const [apiKey, setApiKey] = useState('')
  const [local, setLocal] = useState(false)
  const [country, setCountry] = useState('')
  const presets = [
    { key: 'openai', name: 'OpenAI' },
    { key: 'openrouter', name: 'OpenRouter' },
    { key: 'ollama', name: 'Ollama (local)', local: true },
    { key: 'lm_studio', name: 'LM Studio (local)', local: true },
  ]
  return (
    <div style={{ maxWidth: 420 }}>
      <ProviderForm
        presets={presets}
        presetKey={presetKey}
        onPresetChange={(key) => {
          setPresetKey(key)
          const preset = presets.find((entry) => entry.key === key)
          setName(preset ? preset.name : '')
          setBaseUrl(preset ? (key === 'openai' ? 'https://api.openai.com/v1' : key === 'openrouter' ? 'https://openrouter.ai/v1' : key === 'ollama' ? 'http://localhost:11434/v1' : 'http://localhost:1234/v1') : '')
          setLocal(preset?.local ?? false)
        }}
        name={name}
        onNameChange={setName}
        baseUrl={baseUrl}
        onBaseUrlChange={setBaseUrl}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showLocationKind
        locationKind={local ? 'local' : 'cloud'}
        onLocationKindChange={(kind) => setLocal(kind === 'local')}
        showCountry
        country={country}
        onCountryChange={setCountry}
        countryOptions={[
          { value: 'AT', label: '🇦🇹 Austria' },
          { value: 'DE', label: '🇩🇪 Germany' },
          { value: 'US', label: '🇺🇸 United States' },
        ]}
        apiKeyHelp="Stored in the system keyring — never rendered back"
      />
    </div>
  )
}

export const ConnectionTestRowStory = () => {
  const [status, setStatus] = useState<ConnectionTestStatus>('idle')
  const test = () => {
    setStatus('testing')
    setTimeout(() => setStatus(Math.random() > 0.3 ? 'ok' : 'fail'), 800)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <ConnectionTestRow status={status} onTest={test} latencyMs={240} />
      <ConnectionTestRow status="ok" latencyMs={312} />
      <ConnectionTestRow status="fail" errorMessage="401 unauthorized" onTest={test} />
      <ConnectionTestRow
        variant="inline"
        status="ok"
        latencyMs={95}
        meta="4 models"
        onTest={test}
      />
    </div>
  )
}
