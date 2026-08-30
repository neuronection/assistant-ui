# Publishing & releases

Nobody publishes from a laptop. Every release goes through CI.

## The flow

```text
change src/ → PR with a changeset → merge →
changesets/action opens "Version Packages" PR → merge that →
CI runs lint/typecheck/test/build → changeset publish →
@neuronection/assistant-ui@x.y.z on npm (with provenance)
```

1. Make your changes (component + tests + Ladle story).
2. `pnpm changeset` — pick the bump:
   - new component / new optional prop → **minor**
   - bugfix, token-value-only change → **patch**
   - removed/renamed export, changed required prop, DOM/class contract,
     token renames → **major**
3. Open a PR. CI must be green (React 18/19 typecheck, tests, build,
   React×Tailwind smoke matrix, stories build).
4. Merge. The Release workflow opens a **Version Packages** PR that bumps the
   version and writes `CHANGELOG.md`.
5. Merge the Version Packages PR — that merge publishes.

## Versioning policy

- During `0.x`: breaking changes may land in a **minor** — read the
  changelog. Consumers are our own apps on Dependabot.
- **1.0.0** is cut once Phase 5's H1 (a11y docs) and H2 (visual-regression
  CI) have landed on top of three production apps; from then on the
  discipline above is enforced verbatim — breaking means **major**.
- Apps may lag at most one major behind.

## Infrastructure notes

- `NPM_TOKEN` secret (repo → Settings → Secrets → Actions): granular npm
  token with packages read+write for the `@neuronection` org.
  `GITHUB_TOKEN` is automatic — never create it as a secret (GitHub rejects
  `GITHUB_`-prefixed names).
- The org `neuronection` must exist on npmjs.com — a scoped package PUT
  404s when the scope/org doesn't exist.
- Repo setting needed: Settings → Actions → General → Workflow permissions
  → "Allow GitHub Actions to create and approve pull requests" (for the
  Version Packages PR).
- `pnpm/packageManager` in package.json pins pnpm for `pnpm/action-setup`.
- Provenance: `NPM_CONFIG_PROVENANCE: true` + `id-token: write` — the npm
  page shows a build attestation.

## When a publish run is red

| Error | Meaning |
|---|---|
| `E404` on `PUT @neuronection/...` | npm org missing, or token lacks org access |
| `E403` | Token exists but lacks publish rights for the scope |
| "GitHub Actions is not permitted to create or approve pull requests" | Enable the repo setting above, re-run |
