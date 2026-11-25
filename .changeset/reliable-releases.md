---
'@neuronection/assistant-ui': patch
---

Release plumbing: publishing now waits for the CI run of the same commit instead
of racing it, the Version Packages PR gets its own CI run (a branch pushed with
`GITHUB_TOKEN` never starts one), the rebaseline job only runs on `main` and
produces a screenshots-only PR, `build` no longer repeats the test suite and the
smoke matrix packs the built artifact instead of rebuilding it, and every
release is signed — `changeset publish` spawns `pnpm publish`, which honours
provenance only as a CLI flag, so the release job now injects `--provenance`.
A new `publish-smoke` workflow verifies the registry artifact (exports, `.d.ts`,
attestation, npm == tag == release) and opens an issue when it fails.
`smoke`, `stories`, the React 18 jobs and `visual` are now required checks,
mirrored in `.github/required-checks.json` and guarded by
`scripts/check-required-checks.mjs`.
