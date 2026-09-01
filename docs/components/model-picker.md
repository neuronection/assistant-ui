# ModelPicker

Grouped, searchable provider → model select built on
[`Combobox`](./combobox.md). One provider's `models` become one option
group; `capability` renders as an option badge. The building block inside
`TaskAssignmentPicker` and the registry modal.

## import

```ts
import {
  ModelPicker,
  type ModelPickerProvider,
  type ModelPickerModel,
} from '@neuronection/assistant-ui/model-picker'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `providers` | `ModelPickerProvider[]` | — | `{ id, name, models: { id, name, capability?, capabilities? }[] }` |
| `value` | `string` | — | model id |
| `onChange` | `(modelId: string) => void` | — | |
| `placeholder` | `string` | `'Select a model…'` | |
| `searchPlaceholder` | `string` | `'Search models…'` | |
| `searchLabel` | `string` | — | |
| `emptyLabel` | `string` | — | |
| `loading` | `boolean` | `false` | |
| `disabled` | `boolean` | `false` | |
| `clearable` | `boolean` | `false` | × clear button when a value is set |
| `clearLabel` | `string` | — | |
| `label` | `string` | — | field label |
| `hideLabel` | `boolean` | `false` | keep `label` as the accessible name but don't render it visibly |
| `error` | `string` | — | `role="alert"` line |
| `id` | `string` | auto | |
| `className` / `panelClassName` | `string` | — | wrapper / popover panel |

## controlled contract

`value` in, `onChange(modelId)` out. Filtering/fuzzy ranking is the
Combobox's (synchronous). `capabilities` is not rendered — it exists for
[`TaskAssignmentPicker`](./task-assignment-picker.md) `requires` matching.

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<ModelPicker
  providers={[{ id: 'p1', name: 'Ollama', models: [{ id: 'm1', name: 'Llama 3' }] }]}
  value={modelId}
  onChange={setModelId}
  label="Model"
/>
```

realistic (per-task picker inside an assignment row, from study
`TasksTab` — hidden label, the row X is the remove affordance):

```tsx
<ModelPicker
  providers={catalog}
  value={value[task.id] ?? ''}
  onChange={(modelId) => onAssign(task.id, modelId)}
  clearable={false}
  label={task.label}
  hideLabel
/>
```

## accessibility

See [accessibility.md](../accessibility.md#settings-blocks): Combobox with
grouped provider→model options and capability badges; keyboard contract
inherited from `Combobox` (asserted there).

## related

[`Combobox`](./combobox.md), [`TaskAssignmentPicker`](./task-assignment-picker.md),
[`ModelRegistry`](./model-registry.md).
