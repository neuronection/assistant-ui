# TaskAssignmentPicker

Maps tasks to models: one row per task with a (fallback-capable) model
picker per row. Row pickers can be filtered to models matching a required
capability, rows can be grouped into sections, and `renderMeta` injects
app-side context under each row.

## import

```ts
import {
  TaskAssignmentPicker,
  type TaskAssignmentTask,
  type TaskAssignmentSection,
} from '@neuronection/assistant-ui/task-assignment-picker'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `tasks` | `TaskAssignmentTask[]` | `[]` | flat rendering; ignored when `sections` is set |
| `sections` | `TaskAssignmentSection[]` | — | grouped rendering (`{ id, label, secondary?, tasks }`) |
| `providers` | `ModelPickerProvider[]` | — | `{ id, name, models: { id, name, capability?, capabilities? }[] }` |
| `value` | `Record<string, string \| null>` | — | taskId → modelId (null/undefined = unassigned) |
| `onAssign` | `(taskId: string, modelId: string \| null) => void` | — | `null` = cleared |
| `secondaryValue` | `Record<string, string \| null>` | — | fallback model per taskId |
| `onAssignSecondary` | `(taskId: string, modelId: string \| null) => void` | — | enables fallback pickers for flagged tasks |
| `secondaryLabel` | `string` | `'Fallback model'` | picker label prefix |
| `renderMeta` | `(task: TaskAssignmentTask) => ReactNode` | — | app-rendered per-row context |
| `clearLabel` | `string` | `'Clear assignment'` | row-level × accessible name (`Clear assignment — <task>`) |
| `disabled` | `boolean` | `false` | disables all pickers + clear buttons |
| `className` | `string` | — | merges onto the root |

`TaskAssignmentTask`: `{ id, label, description?, icon?, requires?,
secondary? }` — `requires` filters the row's catalog to matching models,
`secondary` forces the fallback picker for that row. Rows without an `icon`
fall back to a default `Cpu` glyph.

## controlled contract

- Assignment state lives in `value`/`secondaryValue`; the component never
  mutates it. Clearing reports `onAssign(taskId, null)` via the row-level ×
  button — the single remove affordance (row pickers render without their
  internal clear button).
- The picker triggers show the selection themselves; there is no separate
  per-row status line. Primary picker's accessible name is the task label;
  the fallback picker's is `Fallback model — <task>`.
- Catalogs are filtered per row by `requires` (matches `model.capabilities`
  or the legacy single `capability`); providers left with zero models drop
  out of that row's picker.
- Fallback pickers render when the task (directly or via its section) is
  `secondary` **and** `onAssignSecondary` is set. Round-trip both ids in
  your handler (see the [ai-settings guide](../guides/ai-settings.md#3-tasks-taskassignmentpicker)).

## labels & i18n

All strings are props with English defaults; translate at the call site.

## examples

minimal:

```tsx
<TaskAssignmentPicker
  tasks={[{ id: 'chat', label: 'Chat', requires: 'text' }]}
  providers={catalog}
  value={{ chat: 'm1' }}
  onAssign={(taskId, modelId) => assign(taskId, modelId)}
/>
```

realistic (trimmed from study-assistant `TasksTab.tsx`) — sections with
capability defaults + fallback pickers + `renderMeta`; the full wiring is in
the [ai-settings guide](../guides/ai-settings.md#3-tasks-taskassignmentpicker).

## accessibility

See [accessibility.md](../accessibility.md#settings-blocks): task rows with
per-row `ModelPicker`s (accessible name = the task label), clear button
empties the assignment (`Clear assignment — <task>`), optional fallback
picker named `Fallback model — <task>`.

## related

[`ModelPicker`](./model-picker.md), [`Combobox`](./combobox.md),
[`CapabilityChips`](./capability-chips.md).
