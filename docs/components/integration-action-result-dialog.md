# ActionResultDialog

The declarative action-result dialog (plan 33 G3 / ADR-0040 clause 16):
HOSTS the family [SurfaceRenderer](./surface-renderer.md) for extensions'
declarative result payloads — compose, never reinvent. Loading, error (with
detail + optional retry) and ready states ride props; typed `run:*` /
`item:*` action ids emit via `onSurfaceAction` (semantics are the host's);
per-product chrome slots around the payload via `renderChrome`.

## import

```ts
import { ActionResultDialog } from '@neuronection/assistant-ui/integration-action-result-dialog'
```

## props

- `open: boolean` + `onOpenChange(open)` — controlled modal (Radix).
- `status: 'loading' | 'error' | 'ready'` — the state triad, host-driven.
- `result?: { title?, surface: SurfaceView, surfaceLabels? }` — the
  declarative payload (ready renders through SurfaceRenderer).
- `errorDetail?: string | null` — the typed error detail (rendered as data).
- `onRetry?` — renders the retry button on error.
- `onSurfaceAction?(action)` — typed actions out.
- `renderChrome?({ status })` — per-product chrome around the payload.
- `labels?: ActionResultDialogLabels` — title/description/close/loading/
  error/retry (English defaults).
- `className` — merges onto the modal content.

## controlled contract

Fetching, action execution and result persistence are app-side; the dialog
renders the payload and emits typed action ids. Unknown node/action ids
never render (the SurfaceRenderer's law carries over).

## label/i18n contract

`labels` with English defaults; surface labels pass through to the renderer.

## accessibility

Radix dialog semantics; loading is `role="status"`, errors `role="alert"`.
See [accessibility](../accessibility.md).

Related: [SurfaceRenderer](./surface-renderer.md),
[IntegrationCard](./integration-card.md).
