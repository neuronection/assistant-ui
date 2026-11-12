import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'
import { SetupSteps } from '../setup-steps/SetupSteps'
import {
  TranslationProviderSettingsForm,
  type TranslationProviderSettingsFormLabels,
} from './TranslationProviderSettingsForm'
import { TranslationEngineTiles } from './TranslationEngineTiles'
import type {
  TranslationEngineCatalog,
  TranslationEngineCatalogField,
  TranslationProviderFormValue,
  TranslationProviderSaveInput,
} from './types'

export interface TranslationProviderWizardLabels
  extends TranslationProviderSettingsFormLabels {
  /** Progress steps — "Choose engine" → "Configure". */
  chooseStepLabel?: string
  configureStepLabel?: string
  stepsLabel?: string
  tilesLabel?: string
  backLabel?: string
  keyChipLabel?: string
  keylessChipLabel?: string
  cloudChipLabel?: string
  selfHostedChipLabel?: string
}

export interface TranslationProviderWizardProps {
  catalog: TranslationEngineCatalog
  /** Pre-selects an engine and opens the form step directly. */
  initialType?: string | null
  /** Default connection name per type — the app derives it from its
   * existing instances (label, numbered when taken). Seeded into the
   * form's name field, which lives under Advanced. */
  defaultName?: (type: string) => string | null
  /** App-declared extra fields rendered by the settings form. */
  extraFields?: TranslationEngineCatalogField[]
  busy?: boolean
  /** Save failure surfaced on the form step. */
  error?: string | null
  labels?: TranslationProviderWizardLabels
  className?: string
  onSave: (input: TranslationProviderSaveInput) => void
  /** Back from the tiles step (the form step backs into tiles first). */
  onCancel?: () => void
}

const emptyValue = (): TranslationProviderFormValue => ({
  name: '',
  apiKey: '',
  apiBase: '',
  fields: {},
})

/** Two-step translation setup flow in the AI-providers wizard shape:
 * engine tiles ("choose") → catalog-driven settings form ("configure"),
 * with the shared SetupSteps progress header. Mount it in a modal or
 * inline — the flow owns only its step state, persistence stays app-side
 * (ADR-006). */
export const TranslationProviderWizard = React.forwardRef<
  HTMLDivElement,
  TranslationProviderWizardProps
>(function TranslationProviderWizard(
  {
    catalog,
    initialType = null,
    defaultName,
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
    chooseStepLabel: labels?.chooseStepLabel ?? 'Choose engine',
    configureStepLabel: labels?.configureStepLabel ?? 'Configure',
    stepsLabel: labels?.stepsLabel ?? 'Setup progress',
    tilesLabel: labels?.tilesLabel ?? 'Choose a translation engine',
    backLabel: labels?.backLabel ?? 'Back',
    keyChipLabel: labels?.keyChipLabel,
    keylessChipLabel: labels?.keylessChipLabel,
    cloudChipLabel: labels?.cloudChipLabel,
    selfHostedChipLabel: labels?.selfHostedChipLabel,
  }
  const steps = [
    { id: 'choose', label: t.chooseStepLabel },
    { id: 'configure', label: t.configureStepLabel },
  ]

  const [selectedType, setSelectedType] = React.useState<string | null>(initialType)
  const [value, setValue] = React.useState<TranslationProviderFormValue>(emptyValue)

  const selectType = (type: string): void => {
    setSelectedType(type)
    setValue({ ...emptyValue(), name: defaultName?.(type) ?? '', apiBase: catalog.entries[type]?.baseUrl ?? '' })
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
      data-as="translation-provider-wizard"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      <SetupSteps steps={steps} current={inForm ? 1 : 0} label={t.stepsLabel} />
      {inForm ? (
        <TranslationProviderSettingsForm
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
              apiBase: submitted.apiBase,
              apiKey: submitted.apiKey.trim() === '' ? null : submitted.apiKey,
              fields: submitted.fields,
            })
          }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <TranslationEngineTiles
            catalog={catalog}
            onSelect={selectType}
            label={t.tilesLabel}
            keyChipLabel={t.keyChipLabel}
            keylessChipLabel={t.keylessChipLabel}
            cloudChipLabel={t.cloudChipLabel}
            selfHostedChipLabel={t.selfHostedChipLabel}
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
