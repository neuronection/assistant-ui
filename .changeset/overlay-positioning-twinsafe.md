---
'@neuronection/assistant-ui': patch
---

Fix modals rendering off-center (bottom-left, outside the viewport) on
Tailwind 3 apps: overlay centering no longer uses `-translate-x/y-1/2`
utilities. On a TW3 app those class names also resolve through the app's own
stylesheet (transform-based), stacking a second translation on top of the
library's (translate-property) one. `ModalContent`, `PanelModal` and the
Wizard modal now center with `inset-0` + auto margins; small decorations use
arbitrary `translate:` properties; the `as-zoom-in` keyframe no longer
hardcodes a translate.
