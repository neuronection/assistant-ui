---
'@neuronection/assistant-ui': minor
---

feat(settings-shell): respond to the shell's own width instead of the
viewport. The 1+3 rail grid now switches via a container query: below 48rem
of shell width (small windows, phones, or a docked side panel squeezing the
page column) the section rail collapses to a wrapping chip row with the
header and descriptions hidden; at or above it the classic sticky rail with
descriptions renders. Adds `data-as` layout hooks (`settings-shell-body`,
`-nav`, `-navbox`, `-navheader`, `-navitem`, `-navicon`, `-navdesc`,
`-navtrailing`, `-content`); browsers without container-query support get
the narrow layout.
