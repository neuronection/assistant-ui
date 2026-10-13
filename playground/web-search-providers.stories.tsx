import { useState } from 'react'
import {
  WebSearchProvidersPanel,
  type WebSearchProviderCatalog,
  type WebSearchProviderProbeView,
  type WebSearchProviderView,
} from '../src/components/web-search-providers/WebSearchProvidersPanel'

const catalog: WebSearchProviderCatalog = {
  order: ['searxng', 'tavily', 'brave', 'exa', 'serper', 'google-pse'],
  entries: {
    searxng: {
      label: 'SearXNG',
      requiresKey: false,
      keyUrl: null,
      baseUrl: null,
      baseUrlRequired: true,
      baseUrlHint: 'https://searx.example.org',
      notes: 'Self-hosted metasearch — enable the JSON format on the instance.',
    },
    tavily: {
      label: 'Tavily',
      requiresKey: true,
      keyUrl: 'https://app.tavily.com/app/api-key',
      baseUrl: 'https://api.tavily.com',
      baseUrlRequired: false,
      baseUrlHint: 'https://api.tavily.com',
      notes: null,
    },
    brave: {
      label: 'Brave Search',
      requiresKey: true,
      keyUrl: 'https://api-dashboard.search.brave.com/keys',
      baseUrl: 'https://api.search.brave.com/res/v1',
      baseUrlRequired: false,
      baseUrlHint: null,
      notes: null,
    },
    exa: {
      label: 'Exa',
      requiresKey: true,
      keyUrl: 'https://dashboard.exa.ai/api-keys',
      baseUrl: 'https://api.exa.ai',
      baseUrlRequired: false,
      baseUrlHint: null,
      notes: null,
    },
    serper: {
      label: 'Serper (Google)',
      requiresKey: true,
      keyUrl: 'https://serper.dev/api-key',
      baseUrl: 'https://google.serper.dev',
      baseUrlRequired: false,
      baseUrlHint: null,
      notes: null,
    },
    'google-pse': {
      label: 'Google Programmable Search',
      requiresKey: true,
      keyUrl: null,
      baseUrl: 'https://www.googleapis.com/customsearch/v1',
      baseUrlRequired: false,
      baseUrlHint: null,
      notes: 'Needs a Programmable Search Engine id (cx).',
      fields: [{ id: 'google_cx', label: 'Engine id (cx)', required: true, placeholder: 'cx-123' }],
    },
  },
}

const providers: WebSearchProviderView[] = [
  {
    id: 'sp1',
    name: 'Tavily',
    type: 'tavily',
    enabled: true,
    baseUrl: 'https://api.tavily.com',
    keyHint: '••••a41c',
    keySet: true,
  },
  {
    id: 'sp2',
    name: 'Campus SearXNG',
    type: 'searxng',
    enabled: false,
    baseUrl: 'https://searx.example.org',
    keySet: false,
  },
]

export const WebSearchProvidersStory = () => {
  const [probes] = useState<Record<string, WebSearchProviderProbeView>>({
    sp1: { status: 'ok', latencyMs: 214, error: null },
    sp2: { status: 'json_disabled', latencyMs: 96, error: 'JSON format disabled on the instance' },
  })
  return (
    <div className="mx-auto max-w-2xl p-6">
      <WebSearchProvidersPanel
        providers={providers}
        catalog={catalog}
        probes={probes}
        onSave={() => {}}
        onDelete={() => {}}
        onMove={() => {}}
        onToggle={() => {}}
        onTest={() => {}}
      />
    </div>
  )
}

export const WebSearchProvidersEmptyStory = () => (
  <div className="mx-auto max-w-2xl p-6">
    <WebSearchProvidersPanel
      providers={[]}
      catalog={catalog}
      onSave={() => {}}
      onDelete={() => {}}
      onMove={() => {}}
      onToggle={() => {}}
      onTest={() => {}}
    />
  </div>
)
