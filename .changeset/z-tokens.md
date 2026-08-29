---
'@neuronection/assistant-ui': patch
---

Overlay stacking is token-driven: new `--as-z-modal` and `--as-z-popover`
(default 50, see `tokens.css`) replace the hardcoded `z-50` on modal,
popover, menu, combobox, tooltip and wizard surfaces. Apps with high-z chrome
(health's sidebar at z-950) raise them in `theme.css`. Also: for Tailwind 3
apps, import `styles.css` **before** the app's own CSS so app variant
utilities (`lg:relative` vs a library `.fixed`) win the cascade.
