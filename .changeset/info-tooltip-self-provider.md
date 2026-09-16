---
'@neuronection/assistant-ui': patch
---

fix(tooltip): `InfoTooltip` hover mode renders its own `TooltipProvider`,
so it works standalone — previously it threw
"`Tooltip` must be used within `TooltipProvider`" in any tree without an
app-level provider (hit in health-assistant's biomarker detail page).
The tooltip.md minimal example now includes the provider too.
