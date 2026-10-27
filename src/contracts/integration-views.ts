import type {
  ExtensionCapabilityId,
  ExtensionCategory,
  ExtensionKind,
  ExtensionLifecycleState,
  ExtensionOriginClass,
  ExtensionRefStrategy,
  ExtensionRiskClass,
  ExtensionStatusState,
  ExtensionTier,
} from './extension-charter.vocab'

export const INTEGRATION_VIEW_MODELS_VERSION = 1 as const

export interface IntegrationCapabilityView {
  id: ExtensionCapabilityId
  riskClass?: ExtensionRiskClass | null
}

export interface IntegrationProvenanceView {
  author?: string | null
  license?: string | null
  repository?: string | null
  description?: string | null
}

export interface IntegrationUpdateView {
  state: 'available' | 'digest-drift'
  version?: string | null
  ref?: string | null
  digest?: string | null
  requiresReconsent?: boolean
  detail?: string | null
}

export interface IntegrationConsentChangeView {
  /** The machine change-summary groups (plan 37 §3.3): which manifest field groups changed — "what changed", not just "something changed". */
  changed?: string[]
  addedCapabilities?: string[]
  removedCapabilities?: string[]
  versionChange?: { from?: string | null; to?: string | null } | null
  digestChange?: { from?: string | null; to?: string | null } | null
  apiVersionChange?: { from?: string | null; to?: string | null } | null
}

export interface IntegrationConsentPayloadView {
  variant: 'install' | 're-consent' | 'update'
  extensionId: string | null
  version?: string | null
  tier: ExtensionTier
  importClass: string
  capabilities: IntegrationCapabilityView[]
  provenance: IntegrationProvenanceView
  digest: string
  disclosure?: string | null
  disclosureKey?: string | null
  changeSummary?: IntegrationConsentChangeView | null
  metadata?: Record<string, unknown>
}

export interface IntegrationExtensionView {
  id: string
  name: string
  version?: string | null
  summary?: string | null
  originClass: ExtensionOriginClass
  tier: ExtensionTier
  kind?: ExtensionKind | null
  categories?: ExtensionCategory[]
  capabilities?: IntegrationCapabilityView[]
  provenance?: IntegrationProvenanceView | null
  digest?: string | null
  update?: IntegrationUpdateView | null
  metadata?: Record<string, unknown>
}

export interface IntegrationCatalogEntryView extends IntegrationExtensionView {
  hostCompat?: { compatible: boolean; reason?: string | null } | null
  installedInstanceCount?: number | null
}

export type IntegrationConditionId = 'needs-config' | 'needs-secret'

export interface IntegrationInstanceView {
  id: string
  extensionId?: string | null
  name: string
  enabled: boolean
  status?: ExtensionStatusState | null
  lastSuccessAt?: string | null
  consecutiveFailures?: number | null
  conditions?: IntegrationConditionId[]
  originClass?: ExtensionOriginClass | null
  tier?: ExtensionTier | null
  lifecycle?: ExtensionLifecycleState | null
  parked?: boolean
  managedBy?: 'manual' | 'gitops' | null
  digest?: string | null
  update?: IntegrationUpdateView | null
  metadata?: Record<string, unknown>
}

export interface IntegrationExtensionGroupView {
  extension: IntegrationExtensionView
  instances: IntegrationInstanceView[]
}

export interface IntegrationDiscoveredView {
  extensionId: string
  name?: string | null
  digest: string
  ref?: string | null
  compatible: boolean
  reason?: string | null
  tier?: ExtensionTier | null
  originClass?: ExtensionOriginClass | null
  consent?: IntegrationConsentPayloadView | null
  provenance?: IntegrationProvenanceView | null
  metadata?: Record<string, unknown>
}

export interface IntegrationSourceRowView {
  id: string
  kind: 'git' | 'local'
  origin: string
  status?: ExtensionStatusState | null
  error?: string | null
  lastCheckedAt?: string | null
  lastSuccessAt?: string | null
  consecutiveFailures?: number | null
  refStrategy?: ExtensionRefStrategy | null
  refValue?: string | null
  gitops?: boolean
  candidates: IntegrationDiscoveredView[]
  groups: IntegrationExtensionGroupView[]
  metadata?: Record<string, unknown>
}

export interface IntegrationSourceDraft {
  url: string
  localPath: string
  refStrategy: ExtensionRefStrategy
  refValue: string
  subpath: string
  secretSlot?: string | null
  secretValue?: string
}

export interface IntegrationConfigSchemaField {
  type: 'string' | 'number' | 'boolean' | 'array'
  title?: string
  description?: string
  enum?: Array<string | number | boolean>
  default?: string | number | boolean | string[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  minItems?: number
  maxItems?: number
  items?: { type: 'string' }
  'x-secret'?: true
  /** Render as toggle chips over these values; with `x-csv`, the value is
   * the comma-separated string of the selected values (in choices order). */
  'x-choices'?: Array<{ value: string; label: string }>
  /** The field's value is a comma-separated string (see `x-choices`). */
  'x-csv'?: true
  /** Group the field under a collapsed section ('advanced'). */
  'x-section'?: string
}

export interface IntegrationConfigPreset {
  label: string
  values: Record<string, string>
}

export interface IntegrationConfigSchema {
  type: 'object'
  properties: Record<string, IntegrationConfigSchemaField>
  required?: string[]
  /** One-click starting points rendered above the fields. */
  'x-presets'?: IntegrationConfigPreset[]
}

export interface IntegrationConfigFieldView {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array'
  title?: string | null
  description?: string | null
  enum?: Array<string | number | boolean> | null
  defaultValue?: string | number | boolean | string[] | null
  minimum?: number | null
  maximum?: number | null
  minLength?: number | null
  maxLength?: number | null
  pattern?: string | null
  minItems?: number | null
  maxItems?: number | null
  itemType?: 'string' | null
  secret?: boolean
  required?: boolean
  choices?: Array<{ value: string; label: string }> | null
  csv?: boolean
  section?: string | null
}

export type IntegrationConfigValues = Record<
  string,
  string | number | boolean | string[] | null
>

export interface IntegrationConfigValidationView {
  state: 'validating' | 'error' | 'success'
  message?: string | null
  fieldErrors?: Record<string, string> | null
}

export interface IntegrationConfigSaveInput {
  values: IntegrationConfigValues
  secrets: Record<string, string>
}

export function parseIntegrationConfigSchema(
  schema: IntegrationConfigSchema,
): IntegrationConfigFieldView[] {
  const required = new Set(schema.required ?? [])
  return Object.entries(schema.properties ?? {}).map(([name, field]) => ({
    name,
    type: field.type,
    title: field.title ?? null,
    description: field.description ?? null,
    enum: field.enum ?? null,
    defaultValue: field.default ?? null,
    minimum: field.minimum ?? null,
    maximum: field.maximum ?? null,
    minLength: field.minLength ?? null,
    maxLength: field.maxLength ?? null,
    pattern: field.pattern ?? null,
    minItems: field.minItems ?? null,
    maxItems: field.maxItems ?? null,
    itemType: field.items?.type ?? null,
    secret: field['x-secret'] === true,
    required: required.has(name),
    choices: field['x-choices'] ?? null,
    csv: field['x-csv'] === true,
    section: field['x-section'] ?? null,
  }))
}

export function integrationConfigPresets(
  schema: IntegrationConfigSchema,
): IntegrationConfigPreset[] {
  return schema['x-presets'] ?? []
}
