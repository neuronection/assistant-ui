---
name: au-family-map
description: Use for orientation on the Assistant family and assistant-ui's place in it — which apps consume the library, their stacks (React/Tailwind versions, package managers, paths), what is shared vs app-owned, and where the docs live. Use BEFORE any cross-repo work, when a task mentions career-assistant, study-assistant, or health-assistant, or when deciding where a component belongs.
---

# Assistant family map

`@neuronection/assistant-ui` is consumed by three sibling apps. This library
is their shared UI layer: family look via tokens, per-app identity via
`theme.css`.

## Consumers

| App | Repo | Frontend dir | React | Tailwind | PM | Notes |
|---|---|---|---|---|---|---|
| study-assistant | github.com/neuronection/study-assistant | `frontend/` | 19 | 4 | pnpm workspace | **canonical style source** (shadcn-style, cva+Radix+cn) |
| career-assistant | github.com/neuronection/career-assistant | `frontend/` | 18 | 3 | npm | string-concat components (drifted) |
| health-assistant | self-hosted `git.home1.home.arpa/constLiakos/health-assistant` | `core/frontend/` | 18 | 3 | npm | biggest catalog (83 ui files) |

Adoption order (plan 05): **study → career → health**.

## What belongs where

| Lives in the library | Lives in each app |
|---|---|
| Presentational primitives (Button, Modal, Popover…) | API clients, stores, router, i18n wiring |
| Assistant patterns (AiButton, settings blocks — data via props) | Settings/business logic, keyring, validation |
| `--as-*` token defaults + precompiled `styles.css` | `theme.css` identity overrides |
| Ladle stories + tests + changeset per component | App feature components (JobCard, patients, math canvas…) |

**Two-app rule:** a component enters the library only when ≥2 family apps
need it. Single-app candidates go on the decide-and-record list (local
`dev/plans/03-component-catalog.md`) — default answer is *stay in the app*.

## Where to look

- `docs/` in this repo: local-development, adoption, theming, publishing,
  adding-a-component
- Gallery: https://neuronection.github.io/assistant-ui/
- npm: https://www.npmjs.com/package/@neuronection/assistant-ui
- Local-only strategy: `dev/plans/` (gitignored — never stage it)
- Compatibility contract: React 18+19, Tailwind 3+4, any router/data layer

## Rules that keep this adoptable

1. Presentational + controlled only — no fetching, stores, router, secrets
   (ADR-006). Data in, events out. No exceptions.
2. Semantic `--as-*` tokens only in component code; no raw colors.
3. When a library component replaces an app's local copy, the app PR
   deletes the local copy in the same commit. No wrappers, no TODOs.
