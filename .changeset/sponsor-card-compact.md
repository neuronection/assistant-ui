---
'@neuronection/assistant-ui': patch
---

SponsorCard: compact redesign — the decorative primary glow blob, large icon chip and tinted highlight block are gone. The title is bolder with a small inline heart, the footnote renders as a plain second line under the description, and the highlighted channel is emphasized with a primary border and primary name instead of a filled background. The channel list is a responsive grid — one column below the `sm` viewport breakpoint, two above — with a new `columns` prop (`'auto'` default, `1`, `2`) for narrow surfaces like modals.

FamilyBadge: the current app's card is now clickable to its own hub page (it was rendered as a non-interactive div; the ring and "Current app" badge still mark it).
