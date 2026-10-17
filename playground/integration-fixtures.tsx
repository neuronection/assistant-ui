import type {
  IntegrationCatalogEntryView,
  IntegrationConsentPayloadView,
  IntegrationExtensionGroupView,
  IntegrationSourceRowView,
} from '../src/contracts'

export const T3_DISCLOSURE =
  "This extension runs as a separate process outside the app's network perimeter. It opens its own network connections, with no SSRF guard, robots.txt check or rate limiting by the app. The app governs only what it returns: outputs are validated and capped."

export const DIGEST = '3af53a1ef0ece88bdce9469f83db5f584d17fc18b56634578688a9a8794ec75e'

export const consent = (
  overrides: Partial<IntegrationConsentPayloadView> = {},
): IntegrationConsentPayloadView => ({
  variant: 'install',
  extensionId: 'example-posting-fetcher',
  version: '1.0.0',
  tier: 'T3',
  importClass: 'imported',
  capabilities: [{ id: 'sync' }, { id: 'chat-tools', riskClass: 'state-changing' }],
  provenance: {
    author: 'Neuronection',
    license: 'MIT',
    repository: 'https://example.com/your-fork/career-connector-template',
    description: 'Reference posting fetcher',
  },
  digest: DIGEST,
  disclosure: T3_DISCLOSURE,
  disclosureKey: 't3PerimeterDisclosure',
  ...overrides,
})

export const entry = (
  overrides: Partial<IntegrationCatalogEntryView> = {},
): IntegrationCatalogEntryView => ({
  id: 'example-posting-fetcher',
  name: 'Example posting fetcher',
  version: '1.0.0',
  summary: 'Fetches postings from an example ATS through the polite runtime.',
  originClass: 'imported',
  tier: 'T3',
  kind: 'connector',
  categories: ['search'],
  capabilities: [{ id: 'sync' }, { id: 'chat-tools', riskClass: 'destructive' }],
  provenance: {
    author: 'Neuronection',
    license: 'MIT',
    repository: 'https://example.com/your-fork/career-connector-template',
  },
  digest: DIGEST,
  update: null,
  ...overrides,
})

export const group = (
  overrides: Partial<IntegrationExtensionGroupView> = {},
): IntegrationExtensionGroupView => ({
  extension: entry(),
  instances: [
    {
      id: 'inst-1',
      extensionId: 'example-posting-fetcher',
      name: 'primary',
      enabled: true,
      status: 'ok',
      lastSuccessAt: '2026-10-17 02:10 UTC',
      conditions: [],
      originClass: 'imported',
      tier: 'T3',
      digest: DIGEST,
      update: null,
    },
    {
      id: 'inst-2',
      extensionId: 'example-posting-fetcher',
      name: 'secondary',
      enabled: false,
      status: 'failing',
      consecutiveFailures: 4,
      conditions: ['needs-secret'],
      originClass: 'imported',
      tier: 'T3',
      digest: DIGEST,
      update: { state: 'available', version: '1.1.0', requiresReconsent: true },
    },
  ],
  ...overrides,
})

export const source = (
  overrides: Partial<IntegrationSourceRowView> = {},
): IntegrationSourceRowView => ({
  id: 'src-1',
  kind: 'git',
  origin: 'https://git.example.com/neuro/career-connectors',
  status: 'ok',
  error: null,
  refStrategy: 'tag-pattern',
  refValue: 'v*',
  gitops: false,
  candidates: [
    {
      extensionId: 'greenhouse-jobs',
      name: 'Greenhouse jobs',
      digest: '9'.repeat(64),
      compatible: true,
      tier: 'T3',
      originClass: 'listed',
      consent: consent({ extensionId: 'greenhouse-jobs', capabilities: [{ id: 'sync' }] }),
    },
    {
      extensionId: 'legacy-scraper',
      digest: 'a'.repeat(64),
      compatible: false,
      reason: "kind 'bridge' is not hosted for import",
    },
  ],
  groups: [group()],
  ...overrides,
})
