---
'@neuronection/assistant-ui': minor
---

**UserMenu** upgraded to the full family identity-dropdown pattern: `user`
structured identity (+ `roleBadge`), `switcher` slot for app-composed
Profile/Tenant switchers, `status` pill, built-in appearance section
(`theme`/`onThemeChange`, `language`/`onLanguageChange` + `languages`) and a
dedicated danger `onLogout` row. Legacy flat `name`/`email`/`avatarUrl`
props and the `items`/`onItemSelect` contract are unchanged.
