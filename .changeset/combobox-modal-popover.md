---
'@neuronection/assistant-ui': patch
---

The `Combobox` panel popover is now Radix-`modal` so its list scrolls with the mouse wheel inside dialogs — the dialog's scroll lock was swallowing wheel events on the portaled panel. Outside clicks still close the panel; behavior while closed is unchanged.
