# IntegrationConfigForm

The schema-driven config form (plan 33 G2 / ADR-0040 secretLaw D19 + D21):
the charter's JSON-Schema-subset fields as inputs — string, number, boolean,
array-of-string (chip input), enum selects, bounds + pattern UX — with
`x-secret` fields as password inputs whose values never cross props (sealed
slot HINTS only, set/not-set). Async host validation: `onValidate` hands
values out, the host's result comes back through the `validation` prop
(`validating` / `error` + per-field errors / `success`). Defaults application
and save-time validation stay app-side — the form edits values, the host
validates at save.

## import

```ts
import { IntegrationConfigForm } from '@neuronection/assistant-ui/integration-config-form'
import { parseIntegrationConfigSchema } from '@neuronection/assistant-ui/integration-contracts'
```

## props

- `fields: IntegrationConfigFieldView[]` — parsed via
  `parseIntegrationConfigSchema(schema)` (or mapped by the app).
- `values: IntegrationConfigValues` + `onValuesChange(values)` — controlled
  non-secret values; secret values live in the form until save.
- `onSave({ values, secrets })` — submit; secrets cross once, on the way out.
- `onValidate?(values)` — renders the Validate button (the host's async
  validation entry; career's probe is the same shape).
- `validation?: IntegrationConfigValidationView | null` — the host's result:
  `validating` (spinner + `role="status"`, disables Validate), `error`
  (`message` + `fieldErrors` per field, `role="alert"`), `success`
  (`role="status"`).
- `secretSlots?: Record<string, { set, hint? }>` — sealed-slot state per
  secret field; hints display, values never render.
- `conditions?: IntegrationConditionId[]` — needs-config / needs-secret
  badges for the configured occurrence.
- `busy?`, `error?: string | null` — save-in-flight + save failure.
- `labels?: IntegrationConfigFormLabels` — title/hint, submit/cancel/
  validate/validating/success, `conditionLabels`, `secretSetLabel`,
  `secretHintLabel`, `requiredMark`, `enumPlaceholder`, chip labels.
- `onCancel?` — renders the cancel button.
- `className` — merges.

## controlled contract

Values controlled; validation is host-owned (the form renders results, it
never decides). A plaintext secret in stored config is a conformance failure
— apps persist secrets through their sealed store only.

## label/i18n contract

`labels` with English defaults; required fields show a marked label.

## accessibility

Labelled inputs (`htmlFor`/`id`), per-field errors tied via
`aria-describedby`, `role="alert"`/`role="status"` regions. See
[accessibility](../accessibility.md).

Related: [integration-contracts](./integration-contracts.md),
[IntegrationInstancesList](./integration-instances-list.md).
