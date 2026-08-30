---
'@neuronection/assistant-ui': minor
---

New `TimePicker` (+ standalone `TimePickerContent`): clock-face time picker
with a 12h AM/PM UI over a 24-hour `HH:MM` value, editable HH:MM fields
(typing 13–23 or 0 normalizes the period), keyboard-navigable dial, and
default/unstyled trigger variants. New `TimeList`: chip-based editor for
`HH:MM` lists with per-chip pickers, remove-on-hover and a max cap.
Ported from health-assistant (i18n → label props, Radix popover, tokens).
