# Input

Text input with optional label, hint and error wiring: auto `id`
association, `aria-describedby` to hint/error, `aria-invalid` + red ring on
error, error text as `role="alert"`. Bare input (no wrapper) when none of
the three are set.

## import

```ts
import { Input } from '@neuronection/assistant-ui/input'
```

## props

Extends `React.ComponentProps<'input'>` (`value`/`onChange`/`type`/
`placeholder`/`disabled`/… pass through).

| prop | type | default | notes |
|---|---|---|---|
| `label` | `ReactNode` | — | `<label htmlFor>` bound to the input |
| `hint` | `ReactNode` | — | muted line under the input (hidden while `error` shows) |
| `error` | `string` | — | replaces hint, `role="alert"`, `aria-invalid` on the input |
| `id` | `string` | auto | override the generated id |
| `className` | `string` | — | merges onto the `<input>` (wrapper gets full width) |

## controlled contract

Standard input semantics: `value` + `onChange` in from the app (uncontrolled
`defaultValue` also works — nothing internal depends on the value). The
error/hint rendering is derived from props, not state.

## labels & i18n

`label`/`hint` are app content — pass translated strings/nodes. With no
`label`, give the input an `aria-label` yourself.

## examples

minimal:

```tsx
<Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
```

realistic (from study-assistant `ProviderFormDialog.tsx` wiring style):

```tsx
<Input
  label={t('settings.providerName')}
  value={name}
  onChange={(event) => setName(event.target.value)}
  error={nameError ?? undefined}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#inputs): `<label htmlFor>` +
`aria-describedby` (hint, error), `aria-invalid` on error, error text
`role="alert"`.

## related

[`Textarea`](./textarea.md), [`SearchInput`](./search-input.md),
[`ProviderForm`](./provider-form.md).
