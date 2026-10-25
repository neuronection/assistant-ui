import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { SetupSteps } from '../setup-steps/SetupSteps'
import {
  WebSearchProviderSettingsForm,
  type WebSearchProviderSettingsFormLabels,
} from './WebSearchProviderSettingsForm'
import { WebSearchProviderTiles } from './WebSearchProviderTiles'
import type {
  WebSearchProviderCatalog,
  WebSearchProviderCatalogField,
  WebSearchProviderFormValue,
  WebSearchProviderSaveInput,
} from './types'

export interface WebSearchProviderWizardLabels
  extends WebSearchProviderSettingsFormLabels {
  /** Progress steps — "Choose provider" → "Configure". */
  chooseStepLabel?: string
  configureStepLabel?: string
  stepsLabel?: string
  tilesLabel?: string
  backLabel?: string
  keyChipLabel?: string
  keylessChipLabel?: string
}

export interface WebSearchProviderWizardProps
  extends Omit<React.ComponentProps<'div'>, 'onSave' | 'onCancel'> {
  catalog: WebSearchProviderCatalog
  /** Pre-selects a type and opens the form step directly. */
  initialType?: string | null
  /** App-declared extra fields rendered by the settings form. */
  extraFields?: WebSearchProviderCatalogField[]
  busy?: boolean
  /** Save failure surfaced on the form step. */
  error?: string | null
  labels?: WebSearchProviderWizardLabels
  onSave: (input: WebSearchProviderSaveInput) => void
  /** Back from the tiles step (the form step backs into tiles first). */
  onCancel?: () => void
}

const emptyValue = (): WebSearchProviderFormValue => ({
  name: '',
  apiKey: '',
  baseUrl: '',
  fields: {},
})

/** Two-step web-search setup flow in the AI-providers wizard shape:
 * provider tiles ("choose") → catalog-driven settings form ("configure"),
 * with the shared SetupSteps progress header. Mount it in a modal or
 * inline — the flow owns only its step state, persistence stays app-side
 * (ADR-006). */
export const WebSearchProviderWizard = React.forwardRef<
  HTMLDivElement,
  WebSearchProviderWizardProps
>(function WebSearchProviderWizard(
  {
    catalog,
    initialType = null,
    extraFields,
    busy = false,
    error = null,
    labels,
    onSave,
    onCancel,
    className,
    ...props
  },
  ref,
) {
  const t = {
    chooseStepLabel: labels?.chooseStepLabel ?? 'Choose provider',
    configureStepLabel: labels?.configureStepLabel ?? 'Configure',
    stepsLabel: labels?.stepsLabel ?? 'Setup progress',
    tilesLabel: labels?.tilesLabel ?? 'Choose a search provider',
    backLabel: labels?.backLabel ?? 'Back',
    keyChipLabel: labels?.keyChipLabel,
    keylessChipLabel: labels?.keylessChipLabel,
  }
  const steps = [
    { id: 'choose', label: t.chooseStepLabel },
    { id: 'configure', label: t.configureStepLabel },
  ]

  const [selectedType, setSelectedType] = React.useState<string | null>(initialType)
  const [value, setValue] = React.useState<WebSearchProviderFormValue>(emptyValue)

  const selectType = (type: string): void => {
    setSelectedType(type)
    setValue({ ...emptyValue(), baseUrl: catalog.entries[type]?.baseUrl ?? '' })
  }

  const reset = (): void => {
    setSelectedType(null)
    setValue(emptyValue())
  }

  const entry = selectedType ? catalog.entries[selectedType] : undefined
  const inForm = selectedType != null && entry != null

  return (
    <div
      ref={ref}
      data-as="web-search-provider-wizard"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      <SetupSteps steps={steps} current={inForm ? 1 : 0} label={t.stepsLabel} />
      {inForm ? (
        <WebSearchProviderSettingsForm
          type={selectedType}
          entry={entry}
          mode="create"
          value={value}
          onChange={setValue}
          busy={busy}
          error={error}
          extraFields={extraFields}
          labels={{ ...labels, cancelLabel: t.backLabel }}
          onCancel={() => reset()}
          onSubmit={(submitted) => {
            onSave({
              type: selectedType,
              name: submitted.name,
              baseUrl: submitted.baseUrl,
              googleCx: submitted.fields['google_cx'] ?? '',
              apiKey: submitted.apiKey.trim() === '' ? null : submitted.apiKey,
              fields: submitted.fields,
            })
          }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <WebSearchProviderTiles
            catalog={catalog}
            onSelect={selectType}
            label={t.tilesLabel}
            keyChipLabel={t.keyChipLabel}
            keylessChipLabel={t.keylessChipLabel}
          />
          {onCancel ? (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                {t.backLabel}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
})
