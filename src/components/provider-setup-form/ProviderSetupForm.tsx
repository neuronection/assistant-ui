import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { CopyButton } from '../copy-button/CopyButton'
import { Input } from '../input/Input'

/** The shared §15 error-routing enum (family contract — apps key their i18n
 * off exactly these codes). */
export const SETUP_ERROR_CODES = [
  'invalid_key',
  'insufficient_credit',
  'new_user_quota',
  'region_unavailable',
  'timeout',
  'local_not_running',
  'unknown',
] as const

export type SetupErrorCode = (typeof SETUP_ERROR_CODES)[number]

/** English fallback copy per code — apps inject translated labels via
 * `errorLabels` (the library ships no i18n engine, ADR-006). */
export const DEFAULT_SETUP_ERROR_COPY: Record<SetupErrorCode, string> = {
  invalid_key: 'The API key was rejected — check it and try again.',
  insufficient_credit: 'The account has no credit or quota left for this key.',
  new_user_quota: 'The provider hit a rate or quota limit — try again later.',
  region_unavailable: 'This provider or model is not available in your region.',
  timeout: 'The provider took too long to answer — try again.',
  local_not_running: 'Could not reach the local engine — make sure it is running.',
  unknown: 'The provider reported an unknown error.',
}

/** Guided-setup preset slice (app data; snake_case API fields map app-side). */
export interface ProviderSetupFormPreset {
  name: string
  keyUrl?: string
  steps?: string[]
  freeTierNote?: string
  fixedBase?: boolean
  baseUrl: string
  /** Keyless local preset — renders `noKeyLabel` instead of the key field. */
  local?: boolean
}

export interface ProviderSetupFormValue {
  name: string
  apiKey: string
  baseUrl?: string
}

/** Classified setup failure (§15 error routing) — copy comes from
 * `errorLabels`, keyed off the code. */
export interface ProviderSetupFormError {
  code: SetupErrorCode | string
  suspectedVendor?: string | null
}

export interface ProviderSetupFormProps
  extends Omit<React.ComponentProps<'form'>, 'onChange' | 'onSubmit'> {
  preset: ProviderSetupFormPreset
  /** Controlled field values. */
  value: ProviderSetupFormValue
  error?: ProviderSetupFormError | null
  /** Validation/connection test in flight — disables + marks the submit. */
  testing?: boolean
  onSubmit: (value: ProviderSetupFormValue) => void
  onCancel?: () => void
  onChange: (value: ProviderSetupFormValue) => void
  /** Translated error copy per §15 code (`{vendor}` interpolates in the hint). */
  errorLabels?: Partial<Record<string, string>>
  suspectedVendorHint?: string
  /** Notified when a checklist step is copied (Electron apps mirror the copy
   * through their IPC clipboard; the browser write always happens). */
  onCopyStep?: (step: string) => void
  /** Opens the key page — render an anchor by default; Electron apps pass
   * their `openExternal` bridge to get a button instead. */
  onOpenKeyUrl?: (url: string) => void
  /** Extra app content inside the Advanced disclosure (hosting toggle,
   * country select — study/health pattern). */
  advancedExtra?: React.ReactNode
  checklistLabel?: string
  copyLabel?: string
  getKeyLabel?: string
  nameLabel?: string
  apiKeyLabel?: string
  keyPlaceholder?: string
  noKeyLabel?: string
  advancedLabel?: string
  baseUrlLabel?: string
  baseUrlHint?: string
  submitLabel?: string
  cancelLabel?: string
}

/** Guided one-click setup form (plan 26 §6): vendor checklist with copy
 * buttons and key link, connection name, write-only API key
 * (`autoComplete="new-password"`), and an Advanced disclosure whose base URL
 * is read-only for fixed-endpoint presets. Validation, secrets and IPC are
 * the app's business (ADR-006) — the form reports `onSubmit`. */
export const ProviderSetupForm = React.forwardRef<
  HTMLFormElement,
  ProviderSetupFormProps
>(function ProviderSetupForm(
  {
    preset,
    value,
    error,
    testing = false,
    onSubmit,
    onCancel,
    onChange,
    errorLabels,
    suspectedVendorHint = 'This looks like a {vendor} API key.',
    onCopyStep,
    onOpenKeyUrl,
    advancedExtra,
    checklistLabel = 'Setup steps',
    copyLabel = 'Copy',
    getKeyLabel = 'Get an API key',
    nameLabel = 'Connection name',
    apiKeyLabel = 'API key',
    keyPlaceholder = 'sk-…',
    noKeyLabel = 'Runs on your machine — no API key needed.',
    advancedLabel = 'Advanced',
    baseUrlLabel = 'API base URL',
    baseUrlHint,
    submitLabel = 'Connect',
    cancelLabel = 'Back',
    className,
    ...props
  },
  ref,
) {
  const stepText = (step: string): string =>
    step.replaceAll('{url}', preset.keyUrl ?? '')

  const errorCopy = error
    ? (errorLabels?.[error.code] ??
      DEFAULT_SETUP_ERROR_COPY[error.code as SetupErrorCode] ??
      errorLabels?.unknown ??
      DEFAULT_SETUP_ERROR_COPY.unknown)
    : null

  return (
    <form
      ref={ref}
      data-as="provider-setup-form"
      className={cn('flex w-full flex-col gap-3', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!testing) onSubmit(value)
      }}
      {...props}
    >
      <h3 className="text-sm font-semibold text-[var(--as-fg)]">{preset.name}</h3>

      {preset.steps && preset.steps.length > 0 ? (
        <ol
          aria-label={checklistLabel}
          className="list-inside list-decimal space-y-1 text-sm text-[var(--as-muted-fg)]"
        >
          {preset.steps.map((step, index) => (
            <li key={index} className="flex items-start justify-between gap-2">
              <span>{stepText(step)}</span>
              <CopyButton
                value={step}
                label={copyLabel}
                size={14}
                className="mt-0.5 size-6 shrink-0"
                onClick={() => onCopyStep?.(step)}
              />
            </li>
          ))}
        </ol>
      ) : null}

      {preset.keyUrl ? onOpenKeyUrl ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenKeyUrl(preset.keyUrl!)}
          >
            <ExternalLink aria-hidden />
            {getKeyLabel}
          </Button>
        </div>
      ) : (
        <a
          href={preset.keyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[var(--as-primary)] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          {getKeyLabel}
        </a>
      ) : null}

      {preset.freeTierNote ? (
        <p className="text-xs text-[var(--as-muted-fg)]">{preset.freeTierNote}</p>
      ) : null}

      <Input
        label={nameLabel}
        value={value.name}
        placeholder={preset.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />

      {preset.local ? (
        <p className="text-sm text-[var(--as-muted-fg)]">{noKeyLabel}</p>
      ) : (
        <Input
          label={apiKeyLabel}
          type="password"
          autoComplete="new-password"
          placeholder={keyPlaceholder}
          value={value.apiKey}
          onChange={(event) => onChange({ ...value, apiKey: event.target.value })}
        />
      )}

      <details className="rounded-[var(--as-radius)] border border-[var(--as-border)] px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-[var(--as-fg)]">
          {advancedLabel}
        </summary>
        <div className="flex flex-col gap-1 pt-2">
          <Input
            label={baseUrlLabel}
            value={value.baseUrl ?? ''}
            readOnly={preset.fixedBase}
            className="font-mono data-[readonly]:cursor-default data-[readonly]:opacity-80"
            onChange={(event) =>
              onChange({ ...value, baseUrl: event.target.value })
            }
          />
          {!preset.fixedBase && baseUrlHint ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{baseUrlHint}</p>
          ) : null}
          {advancedExtra}
        </div>
      </details>

      {error && errorCopy ? (
        <div role="alert" className="space-y-1">
          <p className="text-sm font-medium text-[var(--as-danger)]">
            {errorCopy}
          </p>
          {error.suspectedVendor ? (
            <p className="text-sm text-[var(--as-muted-fg)]">
              {suspectedVendorHint.replaceAll(
                '{vendor}',
                error.suspectedVendor,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type="submit"
          size="sm"
          loading={testing}
          disabled={testing || (!preset.local && value.apiKey.trim() === '')}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
})
