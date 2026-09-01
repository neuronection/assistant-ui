import * as React from 'react'
import { Building2, House, KeyRound } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from '../input/Input'

export interface ProviderFormProps extends React.ComponentProps<'div'> {
  name: string
  onNameChange: (value: string) => void
  baseUrl: string
  onBaseUrlChange: (value: string) => void
  apiKey: string
  onApiKeyChange: (value: string) => void
  namePlaceholder?: string
  baseUrlPlaceholder?: string
  nameLabel?: string
  baseUrlLabel?: string
  /** Hide the base URL field for provider types that have a fixed endpoint. */
  hideBaseUrl?: boolean
  apiKeyLabel?: string
  /** Optional Local/Cloud toggle — render only when `showLocationKind`. */
  showLocationKind?: boolean
  locationKind?: 'local' | 'cloud'
  onLocationKindChange?: (kind: 'local' | 'cloud') => void
  locationLabel?: string
  localLabel?: string
  cloudLabel?: string
  /** Optional country select — render only when `showCountry`. */
  showCountry?: boolean
  country?: string
  onCountryChange?: (country: string) => void
  countryLabel?: string
  countryOptions?: { value: string; label: string }[]
  countryPlaceholder?: string
  /** Hint under the key field; apps mention keyring storage here. */
  apiKeyHelp?: string
  /** The provider already stores a key (write-only field shows no value). */
  hasStoredKey?: boolean
  storedKeyLabel?: string
  keyPlaceholder?: string
  error?: string
  children?: React.ReactNode
}

/**
 * Standard provider credential fields: name, base URL and a **write-only**
 * masked API key (`onChange` only — the library never renders a stored key;
 * keyring/storage is the app's business, ADR-006).
 */
export const ProviderForm = React.forwardRef<HTMLDivElement, ProviderFormProps>(
  function ProviderForm(
    {
      name,
      onNameChange,
      baseUrl,
      onBaseUrlChange,
      apiKey,
      onApiKeyChange,
      namePlaceholder = 'Provider name',
      baseUrlPlaceholder = 'https://api.example.com/v1',
      nameLabel = 'Name',
      baseUrlLabel = 'API base URL',
      hideBaseUrl = false,
      apiKeyLabel = 'API key',
      apiKeyHelp,
      hasStoredKey = false,
      showLocationKind = false,
      locationKind = 'cloud',
      onLocationKindChange,
      locationLabel = 'Hosting',
      localLabel = 'Local / on-premise',
      cloudLabel = 'Cloud',
      showCountry = false,
      country,
      onCountryChange,
      countryLabel = 'Country',
      countryOptions = [],
      countryPlaceholder = 'Select a country…',
      storedKeyLabel = 'Stored — leave empty to keep',
      keyPlaceholder = 'sk-…',
      error,
      children,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-as="provider-form"
        className={cn('flex w-full flex-col gap-4', className)}
        {...props}
      >
        <Input
          label={nameLabel}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
        />
        {hideBaseUrl ? null : (
          <Input
            label={baseUrlLabel}
            value={baseUrl}
            onChange={(event) => onBaseUrlChange(event.target.value)}
            placeholder={baseUrlPlaceholder}
            className="font-mono"
          />
        )}
        <Input
          label={
            hasStoredKey ? (
              <>
                {apiKeyLabel}{' '}
                <span className="font-normal text-[var(--as-muted-fg)]">
                  ({storedKeyLabel})
                </span>
              </>
            ) : (
              apiKeyLabel
            )
          }
          type="password"
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          placeholder={hasStoredKey ? '•••' : keyPlaceholder}
          autoComplete="new-password"
          hint={
            apiKeyHelp ? (
              <span className="inline-flex items-center gap-1">
                <KeyRound className="size-3" aria-hidden />
                {apiKeyHelp}
              </span>
            ) : undefined
          }
        />
        {showLocationKind && onLocationKindChange ? (
          <div className="space-y-1">
            <span className="text-sm font-medium text-[var(--as-fg)]">{locationLabel}</span>
            <div className="flex gap-2" role="group" aria-label={locationLabel}>
              {(
                [
                  { kind: 'local' as const, label: localLabel, Icon: House },
                  { kind: 'cloud' as const, label: cloudLabel, Icon: Building2 },
                ]
              ).map(({ kind, label, Icon }) => {
                const on = locationKind === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    data-as-location={kind}
                    aria-pressed={on}
                    onClick={() => onLocationKindChange(kind)}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--as-radius)] border px-3 py-2 text-xs font-semibold transition-all',
                      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--as-focus-ring)]',
                      on
                        ? 'border-[var(--as-primary)]/30 bg-[var(--as-primary)]/10 text-[var(--as-primary)] shadow-[var(--as-shadow-1)]'
                        : 'border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-muted-fg)] hover:border-[var(--as-muted-fg)]/40',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
        {showCountry && onCountryChange ? (
          <label className="block space-y-1 text-sm">
            <span className="text-sm font-medium text-[var(--as-fg)]">{countryLabel}</span>
            <select
              value={country ?? ''}
              onChange={(event) => onCountryChange(event.target.value)}
              className="w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] px-3 py-2 text-sm text-[var(--as-fg)]"
            >
              <option value="">{countryPlaceholder}</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {children}
        {error ? (
          <p role="alert" className="text-sm font-medium text-[var(--as-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
