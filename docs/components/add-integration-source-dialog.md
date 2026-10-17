# AddIntegrationSourceDialog

ONE add-source flow for https git sources and the dev/test local-path
variant (plan 33 / ADR-0040 D13; the sources-schema kinds — no zip-bundle
invention): descriptor entry (URL / local path, ref strategy from the
charter vocabulary, ref value, subpath, optional sealed credential slot),
fetch/validate progress and error states. The draft is typed data out; apps
validate it against the family `extension-sources.schema.json` (https-only
production root; the `local` variant is dev/test, host-gated fail-closed).
Discovered manifests render through
[IntegrationSourcesList](./integration-sources-list.md); consent hands off
to [ConsentDialog](./consent-dialog.md).

## import

```ts
import { AddIntegrationSourceDialog } from '@neuronection/assistant-ui/add-integration-source-dialog'
```

## props

- `open: boolean` + `onOpenChange(open)` — controlled modal (Radix).
- `onSubmit(draft: IntegrationSourceDraft)` — emitted with trimmed values
  only when the descriptor is usable (`https://` URL or `/`-rooted local
  path; ref value present for every strategy except `release-tag`).
- `labels?: AddIntegrationSourceDialogLabels` — field labels, submit/cancel/
  close, `submittingLabel` (the progress state),
  `refStrategyLabels` (per charter strategy).
- `busy?: boolean` — the fetch/validate progress state (`role="status"`).
- `error?: string | null` — `role="alert"`.
- `secretSlot?: string | null` — renders the sealed-credential password
  field only when the host declares a slot id; the value never persists in
  props (it rides the submit event once).
- `className` — merges onto the modal content.

## controlled contract

Open state is controlled; the form's draft is internal until submit. The
dialog never fetches, validates remotely or adds anything.

## label/i18n contract

`labels` with English defaults; apps translate at call sites.

## accessibility

Radix dialog semantics (focus trap, Escape → `onOpenChange(false)`); every
input carries an accessible name; progress is `role="status"`, errors
`role="alert"`. See [accessibility](../accessibility.md).

Related: [IntegrationSourcesList](./integration-sources-list.md),
[ConsentDialog](./consent-dialog.md).
