import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { ChipInput } from '../chip-input/ChipInput'
import { Spinner } from '../spinner/Spinner'
import type {
  IntegrationConditionId,
  IntegrationConfigFieldView,
  IntegrationConfigPreset,
  IntegrationConfigSaveInput,
  IntegrationConfigValidationView,
  IntegrationConfigValues,
} from '../../contracts'

export interface IntegrationConfigFormLabels {
  title?: string
  hint?: string
  submitLabel?: string
  cancelLabel?: string
  validateLabel?: string
  validatingLabel?: string
  successLabel?: string
  conditionsTitle?: string
  conditionLabels?: Partial<Record<IntegrationConditionId, string>>
  chipAddLabel?: string
  chipRemoveLabel?: string
  secretSetLabel?: string
  secretHintLabel?: string
  requiredMark?: string
  enumPlaceholder?: string
  presetLabel?: string
  advancedLabel?: string
}

export interface IntegrationConfigFormProps {
  fields: IntegrationConfigFieldView[]
  /** One-click starting points from the schema's `x-presets`. */
  presets?: IntegrationConfigPreset[]
  /** Controlled non-secret values; secret values never cross props. */
  values: IntegrationConfigValues
  onValuesChange: (values: IntegrationConfigValues) => void
  onSave: (input: IntegrationConfigSaveInput) => void
  /** Explicit host-side validation (values out, result back via `validation`). */
  onValidate?: (values: IntegrationConfigValues) => void
  validation?: IntegrationConfigValidationView | null
  /** Sealed slot states — hints only, never values. */
  secretSlots?: Record<string, { set: boolean; hint?: string | null }>
  labels?: IntegrationConfigFormLabels
  /** needs-config / needs-secret badges for the configured occurrence. */
  conditions?: IntegrationConditionId[]
  busy?: boolean
  error?: string | null
  onCancel?: () => void
  className?: string
}

const inputClass =
  'min-w-0 w-full rounded-[var(--as-radius-sm)] border border-[var(--as-border)] bg-[var(--as-surface)] px-2 py-1.5 text-sm text-[var(--as-fg)] placeholder:text-[var(--as-muted-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]'

/**
 * Presentational config form (ADR-0040 secretLaw / D19 + D21): the charter's
 * JSON-Schema-subset fields as inputs — string/number/boolean/array-of-string,
 * enum selects, bounds + pattern UX — with x-secret fields as password inputs
 * whose values never cross props (sealed-slot hints only). Validation display
 * is host-fed (`validation` in); `onValidate` hands values to the host;
 * defaults application and save-time validation stay app-side.
 */
export const IntegrationConfigForm = React.forwardRef<
  HTMLFormElement,
  IntegrationConfigFormProps
>(function IntegrationConfigForm(
  {
    fields,
    presets = [],
    values,
    onValuesChange,
    onSave,
    onValidate,
    validation = null,
    secretSlots = {},
    labels,
    conditions = [],
    busy = false,
    error = null,
    onCancel,
    className,
  },
  ref,
) {
  const t = React.useMemo(
    () => ({
      title: labels?.title,
      hint: labels?.hint,
      submitLabel: labels?.submitLabel ?? 'Save',
      cancelLabel: labels?.cancelLabel ?? 'Cancel',
      validateLabel: labels?.validateLabel ?? 'Validate',
      validatingLabel: labels?.validatingLabel ?? 'Validating…',
      successLabel: labels?.successLabel ?? 'Valid.',
      conditionsTitle: labels?.conditionsTitle ?? 'This instance needs attention',
      conditionLabels: {
        'needs-config': labels?.conditionLabels?.['needs-config'] ?? 'needs config',
        'needs-secret': labels?.conditionLabels?.['needs-secret'] ?? 'needs secret',
      },
      chipAddLabel: labels?.chipAddLabel ?? 'Add value',
      chipRemoveLabel: labels?.chipRemoveLabel ?? 'Remove',
      secretSetLabel: labels?.secretSetLabel ?? 'set — leave empty to keep',
      secretHintLabel: labels?.secretHintLabel ?? 'not set',
      requiredMark: labels?.requiredMark ?? '*',
      enumPlaceholder: labels?.enumPlaceholder ?? 'Select…',
      presetLabel: labels?.presetLabel ?? 'Start with',
      advancedLabel: labels?.advancedLabel ?? 'Advanced',
    }),
    [labels],
  )

  const [secrets, setSecrets] = React.useState<Record<string, string>>({})

  const setValue = (name: string, value: IntegrationConfigValues[string]) => {
    onValuesChange({ ...values, [name]: value })
  }

  const fieldError = (name: string) => validation?.fieldErrors?.[name] ?? null

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    onSave({ values, secrets })
  }

  const renderField = (field: IntegrationConfigFieldView) => {
    const err = fieldError(field.name)
    const describedBy = err ? `integration-config-error-${field.name}` : undefined
    const label = (
      <label
        htmlFor={`integration-config-${field.name}`}
        className="text-xs font-medium text-[var(--as-fg)]"
      >
        {field.title ?? field.name}
        {field.required ? (
          <span className="ml-0.5 text-[var(--as-danger)]" aria-hidden>
            {t.requiredMark}
          </span>
        ) : null}
      </label>
    )
    const errorLine = err ? (
      <p
        id={describedBy}
        role="alert"
        className="text-xs text-[var(--as-danger)]"
        data-testid={`integration-config-error-${field.name}`}
      >
        {err}
      </p>
    ) : null

    if (field.secret) {
      const slot = secretSlots[field.name]
      return (
        <div key={field.name} className="space-y-1">
          {label}
          <input
            id={`integration-config-${field.name}`}
            type="password"
            autoComplete="off"
            className={inputClass}
            value={secrets[field.name] ?? ''}
            aria-describedby={describedBy}
            placeholder={
              slot?.set ? `${field.title ?? field.name} (${t.secretSetLabel})` : undefined
            }
            onChange={(event) =>
              setSecrets((current) => ({ ...current, [field.name]: event.target.value }))
            }
          />
          {slot ? (
            <p className="text-xs text-[var(--as-muted-fg)]" data-testid={`integration-config-secret-${field.name}`}>
              {slot.set
                ? `${field.name}: ${t.secretSetLabel}${slot.hint ? ` — ${slot.hint}` : ''}`
                : `${field.name}: ${t.secretHintLabel}`}
            </p>
          ) : null}
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    if (field.type === 'boolean') {
      return (
        <div key={field.name} className="space-y-1">
          <label
            htmlFor={`integration-config-${field.name}`}
            className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--as-fg)]"
          >
            <input
              id={`integration-config-${field.name}`}
              type="checkbox"
              checked={values[field.name] === true}
              aria-describedby={describedBy}
              onChange={(event) => setValue(field.name, event.target.checked)}
            />
            {field.title ?? field.name}
          </label>
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    if (field.type === 'array') {
      const list = Array.isArray(values[field.name]) ? (values[field.name] as string[]) : []
      return (
        <div key={field.name} className="space-y-1">
          <span
            id={`integration-config-label-${field.name}`}
            className="text-xs font-medium text-[var(--as-fg)]"
          >
            {field.title ?? field.name}
            {field.required ? (
              <span className="ml-0.5 text-[var(--as-danger)]" aria-hidden>
                {t.requiredMark}
              </span>
            ) : null}
          </span>
          <ChipInput
            value={list}
            onChange={(next) => setValue(field.name, next)}
            inputLabel={field.title ?? field.name}
            removeLabel={t.chipRemoveLabel}
          />
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    if (field.choices && field.choices.length > 0) {
      const choices = field.choices
      const current = String(values[field.name] ?? '')
      const selected = field.csv
        ? current.split(',').map((part) => part.trim()).filter(Boolean)
        : current
          ? [current]
          : []
      const toggle = (value: string) => {
        if (field.csv) {
          const next = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]
          // keep the stored order deterministic (choices order)
          const ordered = choices
            .filter((choice) => next.includes(choice.value))
            .map((choice) => choice.value)
          setValue(field.name, ordered.length ? ordered.join(',') : null)
          return
        }
        setValue(field.name, selected.includes(value) ? null : value)
      }
      return (
        <div key={field.name} className="space-y-1">
          {label}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={field.title ?? field.name}>
            {choices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selected.includes(choice.value)}
                onClick={() => toggle(choice.value)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selected.includes(choice.value)
                    ? 'border-[var(--as-focus-ring)] bg-[var(--as-surface-raised)] font-medium'
                    : 'border-[var(--as-border)] bg-[var(--as-surface)] hover:bg-[var(--as-muted)]'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    if (field.enum && field.enum.length > 0) {
      const current = values[field.name]
      return (
        <div key={field.name} className="space-y-1">
          {label}
          <select
            id={`integration-config-${field.name}`}
            className={inputClass}
            value={current === null || current === undefined ? '' : String(current)}
            aria-describedby={describedBy}
            onChange={(event) =>
              setValue(
                field.name,
                field.type === 'number'
                  ? (event.target.value === '' ? null : Number(event.target.value))
                  : event.target.value,
              )
            }
          >
            <option value="">{t.enumPlaceholder}</option>
            {field.enum.map((option) => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    if (field.type === 'number') {
      const current = values[field.name]
      return (
        <div key={field.name} className="space-y-1">
          {label}
          <input
            id={`integration-config-${field.name}`}
            type="number"
            className={inputClass}
            value={typeof current === 'number' ? current : ''}
            min={field.minimum ?? undefined}
            max={field.maximum ?? undefined}
            aria-describedby={describedBy}
            onChange={(event) =>
              setValue(
                field.name,
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
          {field.description ? (
            <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
          ) : null}
          {errorLine}
        </div>
      )
    }

    return (
      <div key={field.name} className="space-y-1">
        {label}
        <input
          id={`integration-config-${field.name}`}
          type="text"
          className={inputClass}
          value={typeof values[field.name] === 'string' ? (values[field.name] as string) : ''}
          minLength={field.minLength ?? undefined}
          maxLength={field.maxLength ?? undefined}
          pattern={field.pattern ?? undefined}
          aria-describedby={describedBy}
          onChange={(event) => setValue(field.name, event.target.value)}
        />
        {field.description ? (
          <p className="text-xs text-[var(--as-muted-fg)]">{field.description}</p>
        ) : null}
        {errorLine}
      </div>
    )
  }

  return (
    <form
      ref={ref}
      data-as="integration-config-form"
      data-testid="integration-config-form"
      className={cn('space-y-3', className)}
      onSubmit={submit}
    >
      {t.title ? (
        <div>
          <p className="text-sm font-medium text-[var(--as-fg)]">{t.title}</p>
          {t.hint ? <p className="mt-0.5 text-xs text-[var(--as-muted-fg)]">{t.hint}</p> : null}
        </div>
      ) : null}

      {conditions.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-[var(--as-radius-sm)] border border-[var(--as-warning)]/50 p-2"
          data-testid="integration-config-conditions"
        >
          <span className="text-xs font-medium text-[var(--as-fg)]">{t.conditionsTitle}:</span>
          {conditions.map((condition) => (
            <span
              key={condition}
              className="rounded-full bg-[var(--as-warning)]/15 px-2 py-0.5 text-[11px] text-[var(--as-fg)]"
            >
              {t.conditionLabels[condition] ?? condition}
            </span>
          ))}
        </div>
      ) : null}

      {presets.length > 0 ? (
        <div className="space-y-1">
          <div className="text-xs font-medium text-[var(--as-muted-fg)]">
            {t.presetLabel}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="rounded-full border border-[var(--as-border)] bg-[var(--as-muted)] px-3 py-1 text-sm transition-colors hover:bg-[var(--as-surface-raised)]"
                onClick={() => onValuesChange({ ...values, ...preset.values })}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {fields.filter((field) => field.section !== 'advanced').map(renderField)}
      {fields.some((field) => field.section === 'advanced') ? (
        <details className="rounded-[var(--as-radius)] border border-[var(--as-border)] p-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--as-fg)]">
            {t.advancedLabel}
          </summary>
          <div className="mt-3 space-y-3">
            {fields.filter((field) => field.section === 'advanced').map(renderField)}
          </div>
        </details>
      ) : null}

      {validation?.state === 'validating' ? (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-[var(--as-muted-fg)]"
          data-testid="integration-config-validating"
        >
          <Spinner className="size-3.5" />
          {t.validatingLabel}
        </p>
      ) : null}
      {validation?.state === 'error' && validation.message ? (
        <p role="alert" className="text-xs text-[var(--as-danger)]" data-testid="integration-config-validation-error">
          {validation.message}
        </p>
      ) : null}
      {validation?.state === 'success' ? (
        <p role="status" className="text-xs text-[var(--as-success)]" data-testid="integration-config-validation-success">
          {t.successLabel}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-[var(--as-danger)]" data-testid="integration-config-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" type="submit" disabled={busy}>
          {t.submitLabel}
        </Button>
        {onValidate ? (
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={busy || validation?.state === 'validating'}
            onClick={() => onValidate(values)}
          >
            {t.validateLabel}
          </Button>
        ) : null}
        {onCancel ? (
          <Button size="sm" variant="ghost" type="button" onClick={onCancel}>
            {t.cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  )
})
