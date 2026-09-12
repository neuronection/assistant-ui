---
'@neuronection/assistant-ui': patch
---

fix(packaging): build the full d.ts shard range in `build:dts` — the committed
script stopped at `DTS_SHARD=4` while the shard map yields 6 shards, so the
last shard (wizard, view-toggle) never emitted its `dist/*.d.ts`; every
published tarball since the shard split shipped a broken exports map that made
`tsc` fail on apps importing `@neuronection/assistant-ui/wizard`
("Could not find a declaration file for module"). Build all six shards; a
fresh `pnpm build && npm pack` now contains all 87 d.ts files.
