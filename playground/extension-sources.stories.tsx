import { action } from '@ladle/react'

import {
  ExtensionSourcesPanel,
  type ExtensionSourceView,
} from '../src/components/extension-sources/ExtensionSourcesPanel'

const T3_DISCLOSURE =
  "This extension runs as a separate process outside the app's network perimeter. It opens its own network connections, with no SSRF guard, robots.txt check or rate limiting by the app. The app governs only what it returns: outputs are validated and capped."

const DIGEST = '3af53a1ef0ece88bdce9469f83db5f584d17fc18b56634578688a9a8794ec75e'

const consent = {
  extensionId: 'example-posting-fetcher',
  version: '1.0.0',
  tier: 'T3',
  importClass: 'imported',
  capabilities: ['sync'],
  provenance: {
    author: 'Neuronection',
    license: 'MIT',
    repository: 'https://example.com/your-fork/career-connector-template',
    description: 'Reference posting fetcher for career-assistant (T3 script tier).',
  },
  digest: DIGEST,
  disclosureKey: 't3PerimeterDisclosure',
  disclosure: T3_DISCLOSURE,
}

const SOURCES: ExtensionSourceView[] = [
  {
    id: 'src-1',
    kind: 'git',
    origin: 'https://git.example.com/neuro/career-connectors',
    status: 'ok',
    candidates: [
      {
        extensionId: 'greenhouse-jobs',
        digest: '9'.repeat(64),
        compatible: true,
        consent: { ...consent, extensionId: 'greenhouse-jobs', capabilities: ['sync', 'secrets'] },
      },
      {
        extensionId: 'hoxhunt-notifier',
        digest: 'a'.repeat(64),
        compatible: false,
        reason: "kind 'bridge' is not hosted for import",
      },
    ],
    installs: [
      {
        id: 'inst-1',
        extensionId: 'example-posting-fetcher',
        version: '1.0.0',
        digest: DIGEST,
        tier: 'T3',
        originClass: 'imported',
        enabled: true,
        update: null,
      },
      {
        id: 'inst-2',
        extensionId: 'lever-jobs',
        version: '1.4.0',
        digest: 'b'.repeat(64),
        tier: 'T3',
        originClass: 'imported',
        enabled: false,
        parked: true,
        update: { state: 'available', digest: 'c'.repeat(64), requiresReconsent: true },
      },
    ],
  },
  {
    id: 'src-2',
    kind: 'local',
    origin: '/home/dev/src/career-connector-template',
    status: 'failing',
    candidates: [],
    installs: [],
  },
]

export const Default = () => (
  <ExtensionSourcesPanel
    sources={SOURCES}
    onAddSource={action('add-source')}
    onCheck={action('check')}
    onRemoveSource={action('remove-source')}
    onConsentInstall={action('consent-install')}
    onEnable={action('enable')}
    onApplyUpdate={action('apply-update')}
    onPark={action('park')}
    onTombstone={action('tombstone')}
  />
)

export const Empty = () => (
  <ExtensionSourcesPanel
    sources={[]}
    onAddSource={action('add-source')}
    onCheck={action('check')}
    onRemoveSource={action('remove-source')}
    onConsentInstall={action('consent-install')}
    onEnable={action('enable')}
    onApplyUpdate={action('apply-update')}
    onPark={action('park')}
    onTombstone={action('tombstone')}
  />
)

export const CustomLabels = () => (
  <ExtensionSourcesPanel
    sources={SOURCES}
    labels={{
      title: 'Erweiterungsquellen',
      hint: 'Import aus Git-Quellen — Einwilligung vor jedem Import.',
      emptyLabel: 'Noch keine Quellen.',
      addLabel: 'Quelle hinzufügen',
      consentConfirmLabel: 'Zustimmen — installieren',
    }}
    onAddSource={action('add-source')}
    onCheck={action('check')}
    onRemoveSource={action('remove-source')}
    onConsentInstall={action('consent-install')}
    onEnable={action('enable')}
    onApplyUpdate={action('apply-update')}
    onPark={action('park')}
    onTombstone={action('tombstone')}
  />
)
