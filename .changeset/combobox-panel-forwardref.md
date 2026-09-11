---
'@neuronection/assistant-ui': patch
---

Fix React ref warning in `Combobox`/`ComboboxMulti`: `ComboboxPanel` is now a
forwardRef component (ref forwarded to the Radix `Popover.Content`), so the
`Popover.Portal` slot can attach refs without the
"Function components cannot be given refs" console warning.
