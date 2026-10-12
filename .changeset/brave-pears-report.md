---
'@neuronection/assistant-ui': minor
---

**Message states (plan 100 S3):** `ChatMessage` state changes now animate instead of snapping.

- **Entrance:** every message bubble rises 4px + fades in on mount (`--as-duration-base`, mount-only — stream re-renders never restart it).
- **Copy feedback:** new `actions.copied` prop (controlled) plus an uncontrolled default — the copy action morphs into a success check for 1.5 s after each copy click, with the `aria-label` following ("Copy" → "Copied", new `labels.copied`, default "Copied").
- **Interrupted:** the "Stopped" chip slides in with a single amber pulse (`--as-warning`); **error** cards slide up into place.
- **Action row:** the hover/focus reveal is now owned by `tokens.css` (`data-as="chat-message-actions"`, opacity + 2px rise, `--as-duration-fast`, reduced-motion safe) instead of Tailwind `group-hover` classes — TW3 app CSS can never collide with it. Keyboard reachability is unchanged.
- **Edit mode:** `ChatMessageEditor` reveals with a slide-up and autofocuses its textarea (previously no focus on mount).
- **Variant switch:** content crossfades (`--as-duration-fast`) when `variants.index` changes on a branched message — automatic, no new props.

Consumers: nothing to wire for entrance/error/interrupted/variant animations; copy feedback works uncontrolled out of the box.
