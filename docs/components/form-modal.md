# FormModal

Form-in-modal shell on the [`Modal`](./modal.md) compound: wraps children in
a real `<form>`, wires Enter-to-submit, busy/disabled submit states, optional
reject button, custom or hidden footer.

## import

```ts
import { FormModal } from '@neuronection/assistant-ui/form-modal'
```

## props

| prop | type | default | notes |
|---|---|---|---|
| `open` / `onOpenChange` | — | — | controlled dialog state |
| `title` | `ReactNode` | — | |
| `description` | `ReactNode` | — | |
| `icon` | `LucideIcon` | — | icon tile next to the title |
| `headerActions` | `ReactNode` | — | trailing actions in the header |
| `children` | `ReactNode` | — | form fields (inside the `<form>`) |
| `onSubmit` | `() => void` | — | omit to hide the submit button |
| `submitting` | `boolean` | `false` | submit shows spinner, other buttons disable |
| `submitDisabled` | `boolean` | `false` | e.g. `!prompt.trim()` |
| `submitLabel` | `string` | `'Save'` | |
| `cancelLabel` | `string` | `'Cancel'` | |
| `closeLabel` | `string` | `'Close'` | × button |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | |
| `contentClassName` | `string` | — | on the `<form>` |
| `bodyClassName` | `string` | — | on the body wrapper |
| `footer` | `ReactNode` | — | replaces the default footer |
| `hideFooter` | `boolean` | `false` | |
| `onReject` | `() => void` | — | destructive button, left-aligned (`sm:mr-auto`) |
| `rejectLabel` | `string` | `'Reject'` | |

## controlled contract

`open`/`onOpenChange` controlled; submit reports via `onSubmit` only when
not `submitting`/`submitDisabled`. The library owns no field state — put
controlled fields in `children`. Enter inside any field triggers submit
(native form semantics).

## labels & i18n

All button labels are props; title/description are app content.

## examples

minimal:

```tsx
<FormModal
  open={open}
  onOpenChange={setOpen}
  title="Rename"
  onSubmit={submit}
  submitting={saving}
>
  <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
</FormModal>
```

realistic (reject + busy, from library/study patterns):

```tsx
<FormModal
  open={open}
  onOpenChange={setOpen}
  title={t('review.title')}
  description={t('review.hint')}
  onSubmit={() => approve.mutate()}
  onReject={() => reject.mutate()}
  submitting={approve.isPending}
  submitLabel={t('review.approve')}
  rejectLabel={t('review.reject')}
>
  <Textarea … />
</FormModal>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): Enter inside a field
submits, disabled submit blocks submission; inherits `Modal`'s focus
restoration and `role="dialog"` wiring.

## related

[`Modal`](./modal.md), [`ConfirmationModal`](./confirmation-modal.md),
[`AiMagicFill`](./ai-magic-fill.md) (built on `FormModal`).
