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

export interface ModelPickerProps {
  providers: ModelPickerProvider[]
  value?: string
  onChange: (modelId: string) => void
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
 * Grouped, searchable provider → model picker. Presentational: the model
 * list comes in via props, selection goes out via `onChange`.
 */
export const ModelPicker = React.forwardRef<HTMLButtonElement, ModelPickerProps>(
  function ModelPicker(
    {
      providers,
      value,
      onChange,
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
    },
    ref,
  ) {
    const options: ComboboxOption[] = React.useMemo(
      () =>
        providers.flatMap((provider) =>
          provider.models.map((model) => ({
            value: model.id,
            label: model.name,
            group: provider.name,
            badge: model.capability,
          })),
        ),
      [providers],
    )

    return (
      <Combobox
        ref={ref}
        options={options}
        value={value}
        onChange={onChange}
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
