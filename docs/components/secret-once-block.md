# SecretOnceBlock

The body of a shown-once secret dialog, shared by health's credential
reveals, career's MCP-server secret and study's token panels (plan 60 D5):
the value in a breaking monospace block, the host's warning copy, and a real
copy button with transient copied feedback.

## import

```ts
import { SecretOnceBlock } from '@neuronection/assistant-ui/secret-once-block'
```

## props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `secret` | `string` | — | The value to show and copy. |
| `warning` | `string` | — | Host copy explaining that the secret is shown once (plain text). |
| `copyLabel` | `string` | `'Copy'` | Visible + accessible name of the copy button. |
| `copiedLabel` | `string` | `'Copied'` | Visible + accessible name while the copied state is active (resets after 1.5 s). |
| `onCopied` | `() => void` | — | Fires after a successful clipboard write (e.g. toast/audit hook). |
| `testId` | `string` | — | Sets `data-testid` on the root element. |
| `className` | `string` | — | Merges. |

## controlled contract

Body only — no modal, dialog, focus trap or close button; wrap it in the
host's overlay. Clipboard writes go through `navigator.clipboard.writeText`
with the same `execCommand` textarea fallback as `CopyButton`. The copied
state is internal and controlled by the component; `onCopied` is the only
event out. The block never stores, logs, masks or fetches the secret, and
failed writes keep the copy label (no error event). Changing `secret` clears
the copied state (and its pending reset timer), so a second reveal never
inherits the first one's feedback.

## labels & i18n

`copyLabel` / `copiedLabel` are the visible and accessible names — translate
them at the call site. `warning` is plain text supplied by the app so its
wording (and any warnings about scope or expiry) stays product-owned.

## examples

minimal:

```tsx
<SecretOnceBlock secret={token} warning={t('tokens.shownOnce')} />
```

realistic (inside the app's modal, translated labels, audit hook):

```tsx
<Modal open={open} onOpenChange={setOpen} title={t('tokens.created')}>
  <ModalBody>
    <SecretOnceBlock
      secret={createdToken.secret}
      warning={t('tokens.copyNow')}
      copyLabel={t('common.copy')}
      copiedLabel={t('common.copied')}
      testId="new-token-secret"
      onCopied={() => toast.success(t('common.copied'))}
    />
  </ModalBody>
  <ModalFooter>
    <Button onClick={() => setOpen(false)}>{t('common.done')}</Button>
  </ModalFooter>
</Modal>
```

## accessibility

The secret is a `<code>` block (`whitespace-pre-wrap` + `break-all`, so long
values wrap instead of overflowing), the warning is plain text with a
decorative icon, and copy is a native `<button>` whose visible label carries
the accessible name. Enter/Space copy; the label flips to `copiedLabel` and
back. Changing `secret` resets the label to `copyLabel`. Styling hooks: `data-as="secret-once-block"` (+ `data-copied`),
`data-as="secret-once-value"`, `data-as="secret-once-warning"`,
`data-as="secret-once-copy"`.

## adoption notes

Health funnels its three existing secret dialogs through one app-local
`SecretOnceReveal.tsx` wrapper around this block (the wrapper owns the
`Modal`); career replaces the inline `McpServerSection` secret body; study
reuses it inside its existing dialog. Keep `client_id` and other
non-secret identifiers outside the block — it carries exactly one secret.
The generic `RevealSecretDialog` is out of scope for plan 60 Phase 4.

## related

[`copy-button`](./copy-button.md) (icon-only copy),
[`confirmation-modal`](./confirmation-modal.md), [`modal`](./modal.md)
(the dialog chrome this body is composed into).
