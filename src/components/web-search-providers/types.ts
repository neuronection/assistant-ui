export type WebSearchProbeStatus =
  | 'ok'
  | 'unreachable'
  | 'auth'
  | 'rate_limit'
  | 'json_disabled'
  | 'error'

export interface WebSearchProviderView {
  id: string
  name: string
  type: string
  enabled: boolean
  baseUrl?: string | null
  googleCx?: string | null
  keyHint?: string | null
  keySet: boolean
}

export interface WebSearchProviderCatalogField {
  id: string
  label: string
  required: boolean
  placeholder?: string
  /** Input kind — text by default. */
  type?: 'text' | 'number'
  /** Renders inside the Advanced disclosure instead of the primary stack. */
  advanced?: boolean
  hint?: string | null
}

export interface WebSearchProviderCatalogEntry {
  label: string
  requiresKey: boolean
  keyUrl?: string | null
  baseUrl?: string | null
  baseUrlRequired: boolean
  baseUrlHint?: string | null
  notes?: string | null
  /** Where the provider runs — rendered as a tile chip. Unknown values
   * render nothing (fail-honest). */
  hosting?: 'cloud' | 'self-hosted'
  fields?: WebSearchProviderCatalogField[]
}

export interface WebSearchProviderCatalog {
  /** Rendering + form order for provider types. */
  order: string[]
  entries: Record<string, WebSearchProviderCatalogEntry>
}

export interface WebSearchProviderFormValue {
  name: string
  apiKey: string
  baseUrl: string
  /** Extra catalog/app field values keyed by field id (e.g. google_cx). */
  fields: Record<string, string>
}

export interface WebSearchProviderSaveInput {
  /** Absent = create. */
  id?: string
  type: string
  name?: string | null
  baseUrl?: string | null
  googleCx?: string | null
  /** `null` keeps the stored key, a value stores it. */
  apiKey?: string | null
  /** Extra field values keyed by field id (rides the catalog fields). */
  fields?: Record<string, string> | null
}

export interface WebSearchProviderProbeView {
  status: WebSearchProbeStatus
  latencyMs?: number | null
  error?: string | null
}
