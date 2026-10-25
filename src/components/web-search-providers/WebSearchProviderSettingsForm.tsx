import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { ProviderLogo } from '../provider-logo/ProviderLogo'
import type {
  WebSearchProviderCatalogEntry,
  WebSearchProviderCatalogField,
  WebSearchProviderFormValue,
} from './types'

export interface WebSearchProviderSettingsFormLabels {
  nameLabel?: string
  apiKeyLabel?: string
  keyOptionalLabel?: string
  keyStoredLabel?: string
  noKeyLabel?: string
  baseUrlLabel?: string
  baseUrlRequiredLabel?: string
  advancedLabel?: string
  getKeyLabel?: string
  saveLabel?: string
  cancelLabel?: string
}

export interface WebSearchProviderSettingsFormProps
  extends Omit<React.ComponentProps<'form'>, 'onChange' | 'onSubmit'> {
  /** Catalog key of the provider being configured (mark + entry lookup). */
  type: string
  entry: WebSearchProviderCatalogEntry
  /** `create` gates the key when the catalog requires one; `edit` renders
   * the stored-key note instead. */
  mode?: 'create' | 'edit'
  value: WebSearchProviderFormValue
  onChange: (value: WebSearchProviderFormValue) => void
  onSubmit: (value: WebSearchProviderFormValue) => void
  onCancel?: () => void
  /** Editing a provider with a stored key — its masked hint for the note. */
  storedKeyHint?: string | null
  /** Validation/save failure — rendered as an alert. */
  error?: string | null
  /** Submit in flight — disables and marks the submit button. */
  busy?: boolean
  /** Opens the key page — render an anchor by default; Electron apps pass
   * their `openExternal` bridge to get a button instead. */
  onOpenKeyUrl?: (url: string) => void
  /** App-declared extra fields (timeout, result count — data, not nodes);
   * rendered with the catalog fields by the same machinery. */
  extraFields?: WebSearchProviderCatalogField[]
  labels?: WebSearchProviderSettingsFormLabels
}

/** Catalog-driven settings form for one web-search provider type — the
 * "configure" step of the tile wizard and the body of an edit page
 * (mirrors the AI ProviderSetupForm principles: vendor key link, write-only
 * key, required-field gating, Advanced disclosure for tuning fields).
 * Fully controlled; persistence and secrets are app-side (ADR-006). */
export const WebSearchProviderSettingsForm = React.forwardRef<
  HTMLFormElement,
  WebSearchProviderSettingsFormProps
>(function WebSearchProviderSettingsForm(
  {
    type,
    entry,
    mode = 'create',
    value,
    onChange,
    onSubmit,
    onCancel,
    storedKeyHint = null,
    error = null,
    busy = false,
    onOpenKeyUrl,
    extraFields,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = {
    nameLabel: labels?.nameLabel ?? 'Name',
    apiKeyLabel: labels?.apiKeyLabel ?? 'API key',
    keyOptionalLabel: labels?.keyOptionalLabel ?? 'API key (optional)',
    keyStoredLabel: labels?.keyStoredLabel ?? 'API key saved',
    noKeyLabel: labels?.noKeyLabel ?? 'No API key needed.',
    baseUrlLabel: labels?.baseUrlLabel ?? 'Base URL (optional)',
    baseUrlRequiredLabel: labels?.baseUrlRequiredLabel ?? 'Base URL (required)',
    advancedLabel: labels?.advancedLabel ?? 'Advanced',
    getKeyLabel: labels?.getKeyLabel ?? 'Get an API key',
    saveLabel: labels?.saveLabel ?? 'Save provider',
    cancelLabel: labels?.cancelLabel ?? 'Cancel',
  }

  const fields: WebSearchProviderCatalogField[] = [
    ...(entry.fields ?? []),
    ...(extraFields ?? []),
  ]
  const primaryFields = fields.filter((field) => !field.advanced)
  const advancedFields = fields.filter((field) => field.advanced)

  const fieldById = (id: string): string => value.fields[id] ?? ''
  const setField = (id: string, next: string): void =>
    onChange({ ...value, fields: { ...value.fields, [id]: next } })

  const keyMissing = mode === 'create' && entry.requiresKey && value.apiKey.trim() === ''
  const baseUrlMissing = entry.baseUrlRequired && value.baseUrl.trim() === ''
  const requiredFieldMissing = fields.some(
    (field) => field.required && (value.fields[field.id] ?? '').trim() === '',
  )
  const saveDisabled =
    busy || keyMissing || baseUrlMissing || requiredFieldMissing

  const renderField = (field: WebSearchProviderCatalogField): React.ReactNode => (
    <Input
      key={field.id}
      label={field.label}
      hint={field.hint ?? undefined}
      placeholder={field.placeholder}
      type={field.type === 'number' ? 'number' : 'text'}
      required={field.required}
      value={fieldById(field.id)}
      onChange={(event) => setField(field.id, event.target.value)}
    />
  )

  return (
    <form
      ref={ref}
      data-as="web-search-provider-settings-form"
      className={cn('flex w-full flex-col gap-3', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!saveDisabled) onSubmit(value)
      }}
      {...props}
    >
      <div className="flex items-center gap-2">
        <ProviderLogo preset={type} />
        <h3 className="text-sm font-semibold text-[var(--as-fg)]">{entry.label}</h3>
      </div>

      {entry.requiresKey && entry.keyUrl ? (
        onOpenKeyUrl ? (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenKeyUrl(entry.keyUrl!)}
            >
              <ExternalLink aria-hidden />
              {t.getKeyLabel}
            </Button>
          </div>
        ) : (
          <a
            href={entry.keyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[var(--as-primary)] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            {t.getKeyLabel}
          </a>
        )
      ) : null}

      {entry.notes ? (
        <p className="text-xs text-[var(--as-muted-fg)]">{entry.notes}</p>
      ) : null}

      <Input
        label={t.nameLabel}
        placeholder={entry.label}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />

      {entry.requiresKey ? (
        <Input
          label={mode === 'edit' ? t.keyStoredLabel : t.apiKeyLabel}
          hint={
            mode === 'edit'
              ? storedKeyHint ?? undefined
              : undefined
          }
          type="password"
          autoComplete="new-password"
          placeholder={mode === 'edit' ? storedKeyHint ?? '••••••' : 'sk-…'}
          value={value.apiKey}
          onChange={(event) => onChange({ ...value, apiKey: event.target.value })}
        />
      ) : (
        <p className="text-sm text-[var(--as-muted-fg)]">{t.noKeyLabel}</p>
      )}

      <Input
        label={entry.baseUrlRequired ? t.baseUrlRequiredLabel : t.baseUrlLabel}
        hint={entry.baseUrlHint ?? undefined}
        placeholder={entry.baseUrlHint ?? undefined}
        className="font-mono"
        required={entry.baseUrlRequired}
        value={value.baseUrl}
        onChange={(event) => onChange({ ...value, baseUrl: event.target.value })}
      />

      {primaryFields.map(renderField)}

      {advancedFields.length > 0 ? (
        <details className="rounded-[var(--as-radius)] border border-[var(--as-border)] px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-[var(--as-fg)]">
            {t.advancedLabel}
          </summary>
          <div className="flex flex-col gap-2 pt-2">{advancedFields.map(renderField)}</div>
        </details>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-[var(--as-danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t.cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" size="sm" loading={busy} disabled={saveDisabled}>
          {t.saveLabel}
        </Button>
      </div>
    </form>
  )
})
