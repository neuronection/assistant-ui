import * as React from 'react'
import { action } from '@ladle/react'

import { IntegrationConfigForm } from '../src/components/integration-config-form/IntegrationConfigForm'
import { parseIntegrationConfigSchema } from '../src/contracts'
import type { IntegrationConfigValues } from '../src/contracts'

const FIELDS = parseIntegrationConfigSchema({
  type: 'object',
  properties: {
    endpoint: { type: 'string', title: 'Endpoint', description: 'Base URL of the service', pattern: '^https://' },
    limit: { type: 'number', title: 'Limit', default: 20, minimum: 1, maximum: 100 },
    verbose: { type: 'boolean', title: 'Verbose logging' },
    tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
    kind: { type: 'string', title: 'Kind', enum: ['rss', 'site', 'api'] },
    token: { type: 'string', title: 'API token', 'x-secret': true },
  },
  required: ['endpoint', 'token'],
})

function Harness(props: Record<string, unknown>) {
  const [values, setValues] = React.useState<IntegrationConfigValues>({ limit: 20 })
  return (
    <div className="max-w-xl">
      <IntegrationConfigForm
        fields={FIELDS}
        values={values}
        onValuesChange={(next) => {
          action('onValuesChange')(JSON.stringify(next))
          setValues(next)
        }}
        onSave={(input) => action('onSave')(JSON.stringify(input))}
        onValidate={(next) => action('onValidate')(JSON.stringify(next))}
        {...props}
      />
    </div>
  )
}

export const Default = () => <Harness />

export const SecretSlotStates = () => (
  <Harness
    secretSlots={{
      token: { set: true, hint: 'gh_pat_…9f2c' },
    }}
  />
)

export const NeedsAttention = () => <Harness conditions={['needs-config', 'needs-secret']} />

export const Validating = () => <Harness validation={{ state: 'validating' }} />

export const ValidationFailed = () => (
  <Harness
    validation={{
      state: 'error',
      message: 'The host rejected the configuration',
      fieldErrors: { endpoint: 'must be an https:// URL' },
    }}
  />
)

export const ValidationPassed = () => <Harness validation={{ state: 'success' }} />
