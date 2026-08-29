---
'@neuronection/assistant-ui': minor
---

Add the six components career-assistant's Phase-2 adoption needs, all shared
with health-assistant (catalog T1): `ChipInput`, `ChipList` (superset with
variants + clickable chips), `Table` (tokenized, with empty state), `RangeBar`
(with optional `label`/`valueLabel`), `ScaleSlider` (+ `scaleColorForValue`),
and `DatePicker` (Radix popover calendar with days/months/years views, min/max,
allowClear, and a roving-tabindex arrow-key day grid — an a11y upgrade over
both app copies). New dependency: `date-fns`.
