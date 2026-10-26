import { useState } from 'react'
import {
  TranslationProvidersPanel,
  type TranslationEngineCatalog,
  type TranslationProbeView,
  type TranslationProviderView,
} from '../src/components/translation-providers'

const catalog: TranslationEngineCatalog = {
  order: ['libretranslate', 'deepl'],
  entries: {
    libretranslate: {
      label: 'LibreTranslate',
      requiresKey: false,
      optionalKey: true,
      keyUrl: null,
      baseUrlRequired: true,
      baseUrl: null,
      baseUrlHint: 'https://libretranslate.local',
      notes: 'Self-hosted translation server — enable the JSON API.',
      hosting: 'self-hosted',
    },
    deepl: {
      label: 'DeepL',
      requiresKey: true,
      optionalKey: false,
      keyUrl: 'https://www.deepl.com/pro-api',
      baseUrlRequired: false,
      baseUrl: null,
      baseUrlHint: 'https://api-free.deepl.com',
      notes: 'Free keys ending in “:fx” route to the free API automatically.',
      hosting: 'cloud',
    },
  },
}

const providers: TranslationProviderView[] = [
  {
    id: 'tp1',
    name: 'Campus LibreTranslate',
    type: 'libretranslate',
    enabled: true,
    apiBase: 'https://libretranslate.local',
    keySet: false,
  },
  {
    id: 'tp2',
    name: 'DeepL main',
    type: 'deepl',
    enabled: false,
    keyHint: '••••ab',
    keySet: true,
  },
]

export const TranslationProvidersStory = () => {
  const [probes] = useState<Record<string, TranslationProbeView>>({
    tp1: { status: 'ok', latencyMs: 88, detail: 'Bonjour' },
    tp2: { status: 'error', error: 'key rejected' },
  })
  return (
    <div className="mx-auto max-w-2xl p-6">
      <TranslationProvidersPanel
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

export const TranslationProvidersEmptyStory = () => (
  <div className="mx-auto max-w-2xl p-6">
    <TranslationProvidersPanel
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
