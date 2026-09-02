---
'@neuronection/assistant-ui': minor
---

New `UserMenu` component: the family-standard user menu (avatar or
initials-disc trigger with name/email, identity header in the panel, item
model with `tone: 'danger'`, `pending`, and checkable items for
theme/language toggles). Built on the `Menu` primitives; also adds
`MenuCheckboxItem` (Radix checkbox menu item with an indicator) to the
menu module. Health's hand-rolled header dropdown and career's plain
sign-out button are the adoption targets (family ADR-0007 program).
