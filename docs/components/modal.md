# Modal

Radix dialog compound — `Modal` (Root), `ModalTrigger`, `ModalContent`,
`ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalFooter`,
`ModalClose` — plus `PanelModal`, a header/body/footer dialog shell
(full-screen on mobile, centered card on desktop).

## import

```ts
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalTrigger,
  ModalClose,
  PanelModal,
} from '@neuronection/assistant-ui/modal'
```

## props — ModalContent

| prop | type | default | notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | max-width step (`sm` 24rem … `xl` 36rem) |
| `closeLabel` | `string` | `'Close'` | built-in × button accessible name |
| `className` | `string` | — | merges; height/scroll already set (`max-h-[85vh]`, overflow-y-auto) |
| …Radix Content props | — | — | `onOpenAutoFocus`, `aria-describedby={undefined}`, etc. |

`Modal` (Root) takes Radix Root props: `open` + `onOpenChange` (controlled)
or `ModalTrigger` for uncontrolled use. Other parts forward native props.

## props — PanelModal

| prop | type | default | notes |
|---|---|---|---|
| `open` / `onOpenChange` | — | — | controlled dialog state |
| `title` | `ReactNode` | — | rendered as the dialog title |
| `headerIcon` / `headerActions` | `ReactNode` | — | leading icon / trailing actions next to the × |
| `footer` | `ReactNode` | — | sticky footer band |
| `hideHeader` | `boolean` | `false` | drops the header, keeps a floating × |
| `bodyClassName` | `string` | — | overrides default body padding |
| `closeLabel` | `string` | `'Close'` | |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | desktop max-width |
| `className` | `string` | — | on the dialog panel |

## controlled contract

Controlled-first: `open` + `onOpenChange` — Escape, × and overlay click all
report `onOpenChange(false)`; the app owns state (and any confirm-before-
close logic). Uncontrolled composition via `Modal` + `ModalTrigger` is
available for simple cases. Overlays portal to `document.body` and stack via
`--as-z-modal`.

## labels & i18n

`closeLabel` (both variants) defaults to `'Close'`; titles are children.

## examples

minimal:

```tsx
<Modal open={open} onOpenChange={setOpen}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Settings</ModalTitle>
      <ModalDescription>Provider configuration.</ModalDescription>
    </ModalHeader>
    <div className="p-4">…</div>
    <ModalFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

realistic — `PanelModal` with header actions and footer (study pattern):

```tsx
<PanelModal
  open={open}
  onOpenChange={setOpen}
  title={t('settings.editProvider')}
  headerIcon={<KeyRound className="size-4" aria-hidden />}
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={() => setOpen(false)}>{t('settings.cancel')}</Button>
      <Button onClick={save} loading={saving}>{t('settings.save')}</Button>
    </div>
  }
>
  <ProviderForm … />
</PanelModal>
```

## accessibility

See [accessibility.md](../accessibility.md#overlays): `role="dialog"`
labelled by title/description, Escape closes **and restores focus to the
trigger**, built-in close button. `PanelModal` reports `onOpenChange(false)`
on Escape. For form-in-modal shells prefer [`FormModal`](./form-modal.md).

## related

[`FormModal`](./form-modal.md), [`ConfirmationModal`](./confirmation-modal.md),
[`Wizard`](./wizard.md), [`Portal`](./portal.md).
