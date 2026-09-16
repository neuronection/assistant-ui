---
'@neuronection/assistant-ui': patch
---

ChatComposer: make the `data-multiline` row hook hysteretic — once set it stays until the draft clears. Apps that restructure the row off the flag (e.g. desktop-assistant's footer wrap) change the textarea's width between states, and a flag re-measured at the new width fed back into itself, flipping the layout on every keystroke near the wrap threshold.
