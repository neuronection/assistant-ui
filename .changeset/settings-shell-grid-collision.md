---
'@neuronection/assistant-ui': patch
---

SettingsShell: the responsive two-pane columns now live in component CSS
(`[data-as='settings-shell']`, one column → four at `64rem`) instead of
`grid-cols-1 lg:grid-cols-4` utilities. Host apps compile their own Tailwind
utilities after the library stylesheet, so any app that generates an
unconditional `.grid-cols-1` overrode the media-query rule and forced the
section nav to stack on top of the content at every viewport width. The shell
no longer carries collidable grid utilities, so the side-by-side layout holds
regardless of app CSS; intentional `className` column overrides still win.
