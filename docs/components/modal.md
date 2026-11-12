# Modal

Radix dialog compound — `Modal` (Root), `ModalTrigger`, `ModalContent`,
`ModalHeader`, `ModalBody`, `ModalTitle`, `ModalDescription`, `ModalFooter`,
`ModalClose` — plus `PanelModal`, a header/body/footer dialog shell
(full-screen on mobile, centered card on desktop).

## import

```ts
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
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
| `padding` | `'padded' \| 'none'` | `'padded'` | `p-6` frame + `gap-4` between sections; `none` for full-bleed dialogs (command palettes, media, self-chromed editors) |
| `closeLabel` | `string` | `'Close'` | built-in × button accessible name |
| `className` | `string` | — | merges; height/scroll already set (`max-h-[85vh]`, overflow-y-auto) |
| …Radix Content props | — | — | `onOpenAutoFocus`, `aria-describedby={undefined}`, etc. |

`Modal` (Root) takes Radix Root props: `open` + `onOpenChange` (controlled)
or `ModalTrigger` for uncontrolled use. Other parts forward native props.

## props — ModalBody

| prop | type | default | notes |
|---|---|---|---|
| `className` | `string` | — | layout-only region (`data-as="modal-body"`) — the content frame owns padding; add spacing modifiers (e.g. `space-y-4`) as needed |
| …div props | — | — | `ModalHeader`/`ModalFooter` are layout-only too — consumers never add per-modal padding wrappers |

## props — PanelModal

| prop | type | default | notes |
|---|---|---|---|
| `open` / `onOpenChange` | — | — | controlled dialog state |
| `title` | `ReactNode` | — | rendered as the dialog title |
| `description` | `ReactNode` | — | rendered under the title and wired as the dialog description (`aria-describedby`) |
| `headerIcon` / `headerActions` | `ReactNode` | — | leading icon / trailing actions next to the × |
| `footer` | `ReactNode` | — | sticky footer band |
| `hideHeader` | `boolean` | `false` | drops the header, keeps a floating × |
| `bodyFill` | `boolean` | `false` | the body fills the space above the footer (`flex flex-col overflow-hidden`) so a child flex column — a form with its own scrolling field area — owns scrolling; pair with `bodyClassName="p-0"`. With `hideHeader` the consumer owns clearance for the floating × |
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

## spacing rhythm (the popup standard)

Every dialog in the family shares one vertical/horizontal rhythm — the
**content frame owns padding** (`ModalContent padding="padded"` →
`p-6 gap-4` is the default), so new dialogs just compose the parts:

- **The frame**: 24px inset on every side, 16px between
  header/body/footer — `ModalContent` provides both; parts carry NO
  padding, and hand-rolled `px-6 pb-6` wrappers are a double-padding bug.
- **Sections inside the body stack `space-y-4`**; field groups inside a
  section use `space-y-3`. Inset/bordered blocks keep `p-3` with
  `space-y-2` inside.
- **Full-bleed dialogs** (command palettes, media, editors with their own
  chrome) opt out with `padding="none"` and own every pixel — see the
  `PaddingNone` story.
- **Meta (label/value) grids `gap-x-6 gap-y-3`**; accent-law text (the
  charter disclosures) gets padding on all sides (`py-1 pl-3 pr-2`).
- **`PanelModal`** keeps its own body default (`p-5 sm:p-6` via
  `bodyClassName`).

**Migrating from the parts-padded contract (≤0.71):** delete hand-rolled
`px-6 pb-6` body wrappers and `p-6`-family classes on composed dialogs —
the frame now provides them; full-bleed dialogs move `p-0`/`gap-0`
overrides to `padding="none"`.

## examples

minimal:

```tsx
<Modal open={open} onOpenChange={setOpen}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Settings</ModalTitle>
      <ModalDescription>Provider configuration.</ModalDescription>
    </ModalHeader>
    <ModalBody>…</ModalBody>
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
  description={t('settings.editProviderHint')}
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

realistic — form panel where only the fields scroll (`bodyFill`):

```tsx
<PanelModal
  open={open}
  onOpenChange={setOpen}
  title={t('record.newTitle')}
  description={t('record.subtitle')}
  headerIcon={<SyringeBadge />}
  bodyFill
  bodyClassName="p-0"
  footer={<RecordActions formId={formId} … />}
>
  <RecordForm formId={formId} />
</PanelModal>
```

`RecordForm` / `RecordActions` above are app-side: the library ships the
shell, the app owns the form and its action bar. The form renders `fields`
(inside its own `flex flex-col` with `min-h-0 flex-1 overflow-y-auto`) and the
native `<form id={formId}>`, so the header and footer stay pinned while the
fields scroll. A submit button in the footer stays a real submit button through
the `form` attribute. Keep the `<form>` in the form component, never inside the
footer.

## accessibility

See [accessibility.md](../accessibility.md#overlays): `role="dialog"`
labelled by title/description, Escape closes **and restores focus to the
trigger**, built-in close button. `PanelModal` reports `onOpenChange(false)`
on Escape. For form-in-modal shells prefer [`FormModal`](./form-modal.md).

## related

[`FormModal`](./form-modal.md), [`ConfirmationModal`](./confirmation-modal.md),
[`Wizard`](./wizard.md), [`Portal`](./portal.md).
