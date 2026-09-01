# Wizard

Multi-step dialog (modal or right-drawer variant) with per-step gating:
steps config + `renderStep(ctx)`, Back/Skip/Next footer, dotted `Stepper`
in the header, per-step `canContinue` gates and `nextLabel` overrides.
`Stepper` is also exported standalone (dots or labels variant).

## import

```ts
import {
  Wizard,
  Stepper,
  type WizardStep,
  type WizardContext,
  type StepperProps,
} from '@neuronection/assistant-ui/wizard'
```

## props — Wizard

| prop | type | default | notes |
|---|---|---|---|
| `open` / `onOpenChange` | — | — | controlled dialog state |
| `title` | `ReactNode` | — | header title |
| `steps` | `WizardStep[]` | — | `{ id, icon?, title?, subtitle?, canContinue?, nextLabel?, hideFooter? }` |
| `renderStep` | `(ctx: WizardContext) => ReactNode` | — | step content |
| `initialStep` | `number` | `0` | uncontrolled reset position on close |
| `step` / `onStepChange` | `number` / `(index: number) => void` | — | controlled step (omit for internal) |
| `onSkip` | `() => void` | — | skip/× handler (default: closes) |
| `skipLabel` | `string \| null` | `'Skip'` | `null` hides the skip button |
| `backLabel` / `nextLabel` | `string` | `'Back'` / `'Next'` | |
| `getStartedLabel` | `string` | `'Get started'` | Next label on the first step |
| `closeLabel` | `string` | `'Close'` | × accessible name |
| `variant` | `'modal' \| 'drawer'` | `'modal'` | drawer = right sheet |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | modal max-width |
| `contentClassName` | `string` | — | on the dialog panel |

`WizardContext` handed to `renderStep`: `{ id, index, step, isFirst,
isLast, next, back, goTo }`.

## props — Stepper

| prop | type | default | notes |
|---|---|---|---|
| `steps` | `StepperStep[]` | — | `{ id, label?, icon? }` |
| `current` | `number` | — | |
| `variant` | `'dots' \| 'labels'` | `'dots'` | dots = compact, sr-only "Step X of Y" |
| `onStepClick` | `(index: number) => void` | — | labels variant only; jump to earlier steps |
| `className` | `string` | — | merges |

## controlled contract

Step state is internal unless you pass `step` + `onStepChange`. `next`
advances only when the current step's `canContinue !== false` (footer
button disables otherwise — the gate, not a blocking modal). `renderStep`
receives the ctx once per render; step content is unmounted on close for
uncontrolled use.

## labels & i18n

All footer/header strings are props; step titles/subtitles are app content.

## examples

minimal:

```tsx
<Wizard
  open={open}
  onOpenChange={setOpen}
  title="Setup"
  steps={[{ id: 'welcome' }, { id: 'done' }]}
  renderStep={(ctx) => (ctx.id === 'welcome' ? <Welcome onNext={ctx.next} /> : <Done />)}
/>
```

realistic (gated step, labels stepper — study onboarding shape):

```tsx
<Wizard
  open={open}
  onOpenChange={setOpen}
  title={t('onboarding.title')}
  steps={[
    { id: 'provider', title: t('onboarding.providerTitle'), icon: Bot, canContinue: !hasProvider },
    { id: 'models', title: t('onboarding.modelsTitle'), icon: Check },
  ]}
  renderStep={(ctx) => (ctx.id === 'provider' ? <ProviderStep /> : <ModelsStep />)}
  getStartedLabel={t('onboarding.start')}
  skipLabel={null}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): dialog
wizard; Enter advances (*Next*) and goes back (*Back*); `canContinue={false}`
disables Next; Escape reports `onOpenChange(false)`. `Stepper` (dots) ships
an sr-only "Step X of Y"; labels variant marks the current step with
`aria-current="step"` and allows jumping to earlier steps.

## related

[`Modal`](./modal.md), [`PanelModal`](./modal.md), [`Stepper`](./wizard.md).
