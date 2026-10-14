import * as React from 'react'
import { cn } from '../../lib/utils'
import {
  Combobox,
  type ComboboxOption,
} from '../combobox'

export interface ModelPickerModel {
  id: string
  name: string
  /** Short capability chip, e.g. `vision` or `tools`. */
  capability?: string
  /** Full capability set, matched by TaskAssignmentPicker `requires`. */
  capabilities?: string[]
}

export interface ModelPickerProvider {
  id: string
  name: string
  models: ModelPickerModel[]
}

interface ModelPickerBaseProps {
  providers: ModelPickerProvider[]
  value?: string
  placeholder?: string
  searchPlaceholder?: string
  searchLabel?: string
  emptyLabel?: string
  loading?: boolean
  disabled?: boolean
  clearable?: boolean
  clearLabel?: string
  label?: string
  /** Keep the accessible name from `label` but do not render it visibly. */
  hideLabel?: boolean
  error?: string
  id?: string
  className?: string
  panelClassName?: string
}

/**
 * Discriminated on `nullOption` (plan 29 / ADR-0036): with the labeled
 * null option set, the option list leads with it and `onChange` receives
 * `null` when it is chosen (the inherit state). Without it the contract
 * is unchanged — `onChange` only ever receives model ids.
 */
export type ModelPickerProps = ModelPickerBaseProps &
  (
    | { nullOption?: undefined; onChange: (modelId: string) => void }
    | { nullOption: { label: string }; onChange: (modelId: string | null) => void }
  )

/**
 * Grouped, searchable provider → model picker. Presentational: the model
 * list comes in via props, selection goes out via `onChange`.
 */
export const ModelPicker = React.forwardRef<HTMLButtonElement, ModelPickerProps>(
  function ModelPicker(props, ref) {
    const {
      providers,
      value,
      onChange,
      nullOption,
      placeholder = 'Select a model…',
      searchPlaceholder = 'Search models…',
      searchLabel,
      emptyLabel,
      loading = false,
      disabled = false,
      clearable = false,
      clearLabel,
      label,
      hideLabel = false,
      error,
      id,
      className,
      panelClassName,
    } = props

    // Per-instance sentinel value for the labeled null entry — cannot
    // collide with a real model id. Internal only: it never reaches the
    // DOM or `onChange`.
    const nullSentinel = React.useId()

    const options: ComboboxOption[] = React.useMemo(
      () => {
        const modelOptions = providers.flatMap((provider) =>
          provider.models.map((model) => ({
            value: model.id,
            label: model.name,
            group: provider.name,
            badge: model.capability,
          })),
        )
        // The inherit state leads the list (ADR-0036 §4): no group of its
        // own, so it renders above every provider group.
        return nullOption
          ? [{ value: nullSentinel, label: nullOption.label }, ...modelOptions]
          : modelOptions
      },
      [providers, nullOption, nullSentinel],
    )

    const emitChange = (modelId: string | null): void => {
      if (modelId === null) {
        if (nullOption) {
          // The props union types `onChange` as null-capable exactly when
          // `nullOption` is set; destructuring loses that correlation.
          (onChange as (modelId: string | null) => void)(null)
        }
        return
      }
      onChange(modelId)
    }

    // Empty value + null option = the inherit entry is the selection, so
    // the trigger names it. Without `nullOption` this is `value` verbatim.
    const selectedValue = value ? value : nullOption ? nullSentinel : value

    return (
      <Combobox
        ref={ref}
        options={options}
        value={selectedValue}
        onChange={(next) => emitChange(next === nullSentinel ? null : next)}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        searchLabel={searchLabel}
        emptyLabel={emptyLabel}
        loading={loading}
        disabled={disabled}
        clearable={clearable}
        clearLabel={clearLabel}
        label={label}
        hideLabel={hideLabel}
        error={error}
        id={id}
        className={cn('w-full', className)}
        panelClassName={panelClassName}
      />
    )
  },
)
