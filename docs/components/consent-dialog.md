# ConsentDialog

The consent surface (plan 33 / ADR-0040 clause 21, D15+D22): renders the
charter's consent content VERBATIM — capabilities (risk-marked), tier +
import class, provenance, the pinned digest and the law disclosure, all
arriving as DATA in the payload. The library never words consent;
paraphrasing the disclosure away is a conformance failure. One dialog for
install consent, capability-growth re-consent and update consent, with the
change summary (added/removed capabilities, version/digest/apiVersion moves)
rendered above the verbatim law text.

## import

```ts
import { ConsentDialog } from '@neuronection/assistant-ui/consent-dialog'
```

## props

- `open: boolean` + `onOpenChange(open)` — controlled modal (Radix).
- `payload: IntegrationConsentPayloadView | null` — the consent payload;
  `variant` picks the title (`install` / `re-consent` / `update`).
- `onConsent(payload)` — the ONLY path that fires consent (explicit user
  act; the app still gates on its own consent persistence).
- `onDecline?(payload)` — fires and closes.
- `labels?: ConsentDialogLabels` — per-variant titles, field labels,
  change-summary labels, confirm/decline/close, `busyLabel`.
- `busy?: boolean` — disables confirm/decline while the app applies.
- `className` — merges onto the modal content.

## controlled contract

Open state controlled; consent persistence, consent records and the digest
pin are app-side. No auto-fire: confirm/decline are the only exits besides
Escape/Close.

## label/i18n contract

`labels` with English defaults (`installTitle`, `reconsentTitle`,
`updateTitle`, `tierLabel`, `versionLabel`, `authorLabel`, `licenseLabel`,
`repositoryLabel`, `digestLabel`, `capabilitiesLabel`, `changesLabel`,
`addedLabel`, `removedLabel`, `versionChangeLabel`, `digestChangeLabel`,
`apiVersionChangeLabel`, `confirmLabel`, `declineLabel`, `closeLabel`,
`busyLabel`). The payload's `disclosure` renders verbatim — never translated
or re-worded (D22).

## accessibility

Radix dialog semantics; the payload renders as a labelled `dl` +
capability chips + the disclosure as plain text (never linkified or
collapsed). See [accessibility](../accessibility.md).

Related: [AddIntegrationSourceDialog](./add-integration-source-dialog.md),
[IntegrationSourcesList](./integration-sources-list.md),
[integration-atoms](./integration-atoms.md).
