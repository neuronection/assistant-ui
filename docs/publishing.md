# Publishing & releases

Nobody publishes from a laptop. Every release goes through CI.

## The flow

```text
change src/ → PR with a changeset → merge →
CI green on main → Release (workflow_run, same SHA) → build →
changesets/action opens "Version Packages" PR →
CI on that PR (dispatched by the job) → merge it →
Release publishes → publish-smoke verifies the registry artifact
```

The Release workflow is triggered by **CI completing successfully on
`main`** and checks out that exact SHA — it never publishes a commit CI has
not validated, and it re-checks out the bot branch's CI so the Version
Packages PR gets real required checks.

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
5. Merge the Version Packages PR — that merge publishes (CI runs on the merge
   commit, then Release publishes).

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
- Every workflow action is pinned to a commit SHA with its tag in a comment;
  Dependabot's `github-actions` update keeps the pins current. The gitleaks
  tarball is checked against the release's `checksums.txt` before it runs, and
  `npm-token-canary.yml` (weekly) fails when `NPM_TOKEN` expires or loses the
  `@neuronection` scope, so a release is never the first to find out.
- **Provenance** is attached: the Release job puts a shim first on `PATH` that
  passes `--provenance` to the `pnpm publish` that `changeset publish` spawns.
  pnpm honours provenance only as a CLI flag — `NPM_CONFIG_PROVENANCE` and
  `.npmrc: provenance=true` are ignored, which is why 0.90.0 and 0.91.0 shipped
  unsigned. `id-token: write` on the job supplies the OIDC identity.
  Verify with
  `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/-/npm/v1/attestations/@neuronection%2fassistant-ui@<version>`
  — it must be `200`, not `404`. The `publish-smoke` workflow asserts this.

## Verifying a published version

`publish-smoke` (`workflow_run` on Release, or `workflow_dispatch` with a
`version`) installs the registry tarball into a scratch consumer and asserts:

- the exports map resolves for `.`, `./filters`, `./chat-core` and
  `./styles.css`, with the `.d.ts` files present in the tarball;
- the packages actually import;
- an npm provenance attestation exists, and `npm audit signatures` passes;
- npm's version, the `v<version>` tag and the GitHub release all agree (a
  partial publish — npm ok, tag push failed — is otherwise silent).

It opens an issue when it fails on a real Release. Re-run it for any historical
version: `gh workflow run publish-smoke.yml -f version=0.91.0`.


## Recovering a bot PR that shows 0 jobs

A branch pushed with `GITHUB_TOKEN` never starts workflows: the PR appears with
**0 checks**, and required checks can never report. In order of preference:

1. **Re-run the workflow** (`gh run rerun <id> --failed`) if a run exists.
2. **Dispatch CI** — `gh workflow run ci.yml --ref <branch>`. The Release and
   `visual-rebaseline` jobs do this automatically now; do it by hand only for
   pre-Plan-103 branches.
3. **Empty commit** on the branch (last resort; it must still be a real push by
   a human identity).

## Rolling back a release

- `npm dist-tag add @neuronection/assistant-ui@<previous> latest` — consumers
  get the previous version on the next install.
- **Do not** `npm unpublish` from CI; it is a manual owner decision (72 h
  window) and breaks anyone who already installed the version.
- A partial publish (npm ok, tag/GitHub release missing) is detected by the
  `publish-smoke` parity check; create the missing tag/release, never re-publish
  the same version.

## When publish smoke fails

The version is already on npm — this is an **alert, not a rollback**.

1. **Artifact incomplete** (missing `.d.ts`, broken export): fix forward with a
   patch release. Do not re-publish the same version.
2. **Unusable or wrong contents**: move the tag first —
   `npm dist-tag add @neuronection/assistant-ui@<previous> latest` — then fix
   forward. `npm unpublish` is an owner decision, never a CI step.
3. **Only the parity check failed** (npm ok, tag or GitHub release missing):
   create the missing tag/release; never re-publish the version.
4. **Missing attestation**: the publish ran without `--provenance`. Check the
   Release log for the "Make the publish tool sign its artifacts" step and that
   `id-token: write` is still on the job.

## Required checks

The required contexts for `main` live in repository settings, mirrored in
`.github/required-checks.json`. `scripts/check-required-checks.mjs` (run by
`lint` and `pnpm verify`) fails if a mirrored context no longer matches a job
display name in `.github/workflows/` — a renamed job, especially a matrix row
such as `smoke (react18-tailwind3)`, would otherwise make every PR unmergeable.
Change the ruleset and the mirror in the same step.

## When a publish run is red

| Error | Meaning |
|---|---|
| `E404` on `PUT @neuronection/...` | npm org missing, or token lacks org access |
| `E403` | Token exists but lacks publish rights for the scope |
| "GitHub Actions is not permitted to create or approve pull requests" | Enable the repo setting above, re-run |
