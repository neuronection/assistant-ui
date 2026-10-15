# ExtensionSourcesPanel

The family's extension-source surface (ADR-0040 D13+D22 / plan 32
Phase 3): an ordered git-source list — check, remove — with each
source's discovered candidates (consent payloads rendered verbatim),
digest-pinned installs with origin-class chips, update/park/tombstone
affordances, and an add-from-git form. The panel is presentational and
controlled: sources, candidates and consent payloads come in as data,
every mutation goes out as an event. Persistence, consent records,
digest pinning, GitOps reconcile and the git transport are app-side.

## import

```ts
import { ExtensionSourcesPanel } from '@neuronection/assistant-ui/extension-sources'
```

## data contracts

- `ExtensionSourceView` — one source row: `id, kind ('git' | 'local'),
  origin, status ('ok' | 'degraded' | 'failing' | 'stale' — the family
  status vocabulary, D21), candidates[], installs[]`.
- `ExtensionCandidateView` — one discovered extension: `extensionId,
  digest, compatible, reason`, plus its `consent`
  (`ExtensionConsentPayload`) — what a consent surface MUST show:
  capabilities, `tier` + `importClass`, provenance (rendered VERBATIM),
  the pinned `digest`, and the perimeter `disclosure` (also verbatim —
  ADR-0040 clause 21; paraphrasing it away is a conformance failure).
- `ExtensionInstallView` — one installed extension: `extensionId,
  version, digest, tier, originClass ('bundled' | 'imported' |
  'listed'), enabled, parked, update { state, requiresReconsent }`.
  The origin-class chip is display law (D25): an extension never renders
  as official unless bundled.
- `ExtensionSourceDraft` — the add-form output: `url | localPath,
  refStrategy + refValue, subpath`. Apps validate the descriptor against
  the family `extension-sources.schema.json` (https-only production
  root; the `local` variant is dev/test, host-gated fail-closed).

## props

- `sources` — ordered source rows (rendering order).
- `busy`, `checkingId` — disable affordances while app-side work runs.
- `labels` — every visible string (title, hint, badges, aria labels,
  consent field labels); English defaults, no i18n engine.
- `onAddSource(draft)` / `onCheck(id)` / `onRemoveSource(id)` — source
  lifecycle.
- `onConsentInstall(sourceId, candidate)` — emitted ONLY from the
  two-step consent confirmation (the payload renders before any install
  affordance fires; the app still gates on its own consent flag).
- `onEnable(install, enabled)` / `onApplyUpdate(install)` /
  `onPark(install)` / `onTombstone(install)` — install lifecycle. Apps
  must keep "never auto-enable" and "no auto-apply" semantics
  (ADR-0040 clause 21) — the panel only emits explicit user acts.
- `renderConsent(payload)` — content slot overriding the default consent
  body (e.g. to add host-specific copy). The verbatim disclosure must
  survive any override.
