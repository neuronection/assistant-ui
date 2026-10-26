export type TranslationProbeStatus = 'ok' | 'error'

export interface TranslationProviderView {
  id: string
  name: string
  type: string
  enabled: boolean
  apiBase?: string | null
  keyHint?: string | null
  keySet: boolean
}

export interface TranslationEngineCatalogField {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  /** Input kind — text by default. */
  type?: 'text' | 'number'
  /** Renders inside the Advanced disclosure instead of the primary stack. */
  advanced?: boolean
  hint?: string | null
}

export interface TranslationEngineCatalogEntry {
  label: string
  requiresKey: boolean
  /** Key is optional (public/self-hosted instances) — renders the key
   * input without gating save on it. */
  optionalKey?: boolean
  keyUrl?: string | null
  baseUrlRequired: boolean
  baseUrl?: string | null
  baseUrlHint?: string | null
  notes?: string | null
  hosting?: 'cloud' | 'self-hosted'
  fields?: TranslationEngineCatalogField[]
}

export interface TranslationEngineCatalog {
  /** Rendering + form order for engine types. */
  order: string[]
  entries: Record<string, TranslationEngineCatalogEntry>
}

export interface TranslationProviderFormValue {
  name: string
  apiKey: string
  apiBase: string
  /** Extra catalog/app field values keyed by field id. */
  fields: Record<string, string>
}

export interface TranslationProviderSaveInput {
  /** Absent = create. */
  id?: string
  type: string
  name?: string | null
  apiBase?: string | null
  /** `null` keeps the stored key, a value replaces it. */
  apiKey?: string | null
  /** Extra field values keyed by field id. */
  fields?: Record<string, string> | null
}

export interface TranslationProbeView {
  status: TranslationProbeStatus
  latencyMs?: number | null
  /** The test translation — shown as the probe's detail. */
  detail?: string | null
  error?: string | null
}
