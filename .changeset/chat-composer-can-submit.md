---
'@neuronection/assistant-ui': minor
---

ChatComposer: add the `canSubmit` override for attachment-only submits. The send button's default guard (`value.trim() !== ''`) blocks turns that carry only attachments — health-assistant's image-only "what's this?" chat turn is the driving case. Apps pass `canSubmit={draft.trim() !== '' || hasReadyAttachments}` (or `false` to force-disable); the Enter/form path is unchanged, the app's `onSubmit` stays the single submit guard. Consumers: health wires it in its chat composer (plan 13 H1); career/study only if they add attachment-only sends.
