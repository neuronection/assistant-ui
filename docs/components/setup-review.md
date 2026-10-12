# SetupReview

Editable pre-flight review (plan 26 §6): **model-select cards** with
capability icons plus gap-fill **switch rows** with `now:` sub-lines and the
never-removes footnote. Every edit emits the full five-bind options body —
`{curatedIds, bindChat, bindVision, bindStt, bindDecision}` (D14) —
controlled: feed the changed state back through `models`/`slots`. Append
semantics: nothing existing is ever removed by a setup run.

## import

```ts
import {
  SetupReview,
  type SetupReviewOptions,
} from '@neuronection/assistant-ui/setup-review'
```

## props

Extends `React.ComponentProps<'div'>` (spread onto the root).

| prop | type | default | notes |
|---|---|---|---|
| `models` | `SetupReviewModel[]` | — | `{ id, name, caps?, selected }` — curated cards, rendered in order; hidden entirely when empty |
| `slots` | `SetupReviewSlot[]` | — | `{ id, label, bind, currentValue?, optionsKey }` — one slot per `optionsKey` (`'bindChat' \| 'bindVision' \| 'bindStt' \| 'bindDecision'`); chat presets pass text/vision/stt, **decision-only presets pass the decision slot only** |
| `onOptionsChange` | `(options: SetupReviewOptions) => void` | — | the full options body on every card/switch edit |
| `capIcons` | `Partial<Record<string, LucideIcon>>` | — | override the default capability→icon map |
| `modelsLabel` | `string` | `'Models to save'` | card group `aria-label` |
| `footnote` | `string` | `'Existing assignments and models are never removed.'` | the never-removes footnote |

`SetupReviewOptions` is `{ curatedIds: string[]; bindChat: boolean;
bindVision: boolean; bindStt: boolean; bindDecision: boolean }` — the
camelCase (TS/desktop-IPC) shape; Python apps convert to snake_case
(`curated_ids`, `bind_*`) app-side per the §15 naming rule.

## controlled contract

Controlled by the options body's projection: `models[].selected` ↔
`curatedIds` (order preserved), `slots[].bind` ↔ the bind flags. Toggling a
card or switch emits the complete new body; the app stores it and re-renders.

## labels & i18n

Slot labels and `currentValue` sub-lines are caller content; `modelsLabel`
and `footnote` are props with English defaults.

## examples

```tsx
const [options, setOptions] = useState<SetupReviewOptions>({
  curatedIds: preset.curatedModels ?? [],
  bindChat: true,
  bindVision: true,
  bindStt: Boolean(preset.sttModel),
  bindDecision: Boolean(preset.decisionModels?.length),
})

<SetupReview
  models={(preset.curatedModels ?? []).map((id) => ({
    id,
    name: id,
    caps: inferModelCaps(id),
    selected: options.curatedIds.includes(id),
  }))}
  slots={[
    ...(chatPreset
      ? [
          { id: 'chat', label: TEXT.SETUP_REVIEW_FILL_TEXT, bind: options.bindChat,
            currentValue: `now: ${assignments.chat ?? 'unset'}`, optionsKey: 'bindChat' },
          { id: 'vision', label: TEXT.SETUP_REVIEW_FILL_VISION, bind: options.bindVision,
            currentValue: `now: ${assignments.vision ?? 'unset'}`, optionsKey: 'bindVision' },
        ]
      : []),
    ...(preset.decisionModels?.length
      ? [{ id: 'decision', label: TEXT.SETUP_REVIEW_FILL_DECISION, bind: options.bindDecision,
          currentValue: decisionSlotSummary, optionsKey: 'bindDecision' }]
      : []),
  ]}
  onOptionsChange={setOptions}
  footnote={TEXT.SETUP_REVIEW_FOOTNOTE}
/>
```

## accessibility

Cards are `aria-pressed` toggle buttons in an `aria-label`ed group; rows are
[`SwitchRow`](./switch-row.md) switches (`role="switch"` + `aria-checked`);
Tab reaches cards then switches, Enter/Space toggle both (asserted in
`tests/setup-review.test.tsx`); axe-clean with the Decision group
(`tests/ai-settings-assembly.test.tsx`).

## related

[`SwitchRow`](./switch-row.md), [`ProviderSetupForm`](./provider-setup-form.md),
[`TaskAssignmentPicker`](./task-assignment-picker.md) (the Decision group the
review's `bindDecision` fills), [ai-settings guide](../guides/ai-settings.md).
