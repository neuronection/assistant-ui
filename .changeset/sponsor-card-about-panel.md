---
'@neuronection/assistant-ui': minor
---

Add `SponsorCard` to the about module and a `sponsor` prop on `AboutPanel`. Channels are data-driven (`SponsorChannel[]`), so apps can start with Buy Me a Coffee (`https://buymeacoffee.com/neuronection`) and add future funding methods without API changes. Highlighted channels render as primary CTAs; per-channel `data-as-channel="<id>"` hooks allow app-side brand theming.
