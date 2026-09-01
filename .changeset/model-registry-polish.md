---
'@neuronection/assistant-ui': patch
---

Model-registry modal polish from live testing: the combobox panel re-enables `pointer-events` so catalogs scroll with the mouse inside dialogs (Radix Dialog blocks body-level pointer events on portaled panels); temperature/max-tokens fields use a dedicated number field with spinner chevrons at the far right (native spinners hidden) and an inline clear button; picking a catalog model auto-fills an editable display name (dashes/colons/dots → spaces, version dots preserved, acronym-aware title case — ports the health-assistant beautifier) unless the label was hand-edited.
