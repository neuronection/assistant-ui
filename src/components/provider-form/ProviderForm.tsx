import * as React from 'react'
import { KeyRound } from 'lucide-react'
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
