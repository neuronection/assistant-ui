---
'@neuronection/assistant-ui': patch
---

fix(build): un-block the release gate — `pnpm build` no longer dies with `ERR_WORKER_OUT_OF_MEMORY` in tsup's dts worker (CI's 7 GB runner and memory-capped machines both hit it once the entry count reached ~80). Declaration emission now runs as sequential `dts: { only: true }` shards (`build:dts`, one tsup invocation + one dts worker each, `DTS_SHARD=0..N` over `tsup.dts.config.ts`, ~10 entries per shard) instead of one worker accumulating all 80 entries; JS output still builds as a single config, so chunk sharing is unchanged. tsup is `pnpm patch`ed to give the dts worker an explicit 3 GB heap (`resourceLimits.maxOldGenerationSizeMb`, overridable via `TSUP_DTS_WORKER_HEAP_MB`) because tsup spawns it without limits and Node sizes the default from total RAM, not cgroup/runner limits. Verified end-to-end under a 7 GB memory cap.
