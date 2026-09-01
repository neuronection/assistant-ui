# utilities

Non-component exports: the fuzzy search scorer, `cn`, and the tokens module.
All are re-exported from the root barrel; `fuzzy` has no dedicated subpath.

## fuzzy search (`searchScore`, `fuzzyScore`)

Source: `src/lib/fuzzy.ts`. `Combobox`'s default filter runs
`searchScore` against each option's `label`, `value` and `description`, so the
behavior below is what users get in every combobox-driven picker
(`ModelPicker`, `ModelRegistry`'s add-model modal, apps' own `Combobox`
usage).

```ts
import { fuzzyScore, searchScore, typoDistance } from '@neuronection/assistant-ui'
```

- `searchScore(query, target)` → `number | null`. The full pipeline:
  structural match first, then bounded typo tolerance. `null` = no match.
- `fuzzyScore(query, target)` → `number | null`. The structural part only
  (no typo tolerance) — the base of `searchScore`.
- `typoDistance(a, b, max)` → bounded Damerau-Levenshtein distance
  (substitutions, insertions, deletions, transpositions) or `null` when the
  distance exceeds `max` (early exit). Exported for app-side reuse.

### ranking model

Both matching and scoring are case-insensitive. Highest tier wins; ties
within a tier are broken by the bonus arithmetic below.

| tier | base score | when |
|---|---|---|
| exact | `100 + query.length` | query equals target |
| substring | `80 + boundary bonus + query.length` | target contains the query |
| token substring | `60 + boundary bonus` | a whitespace-separated query token is a substring of the target |
| token subsequence | `30 + per-character points` | every query token's characters appear in order |
| typo | `20 + query.length - distance (+6 when matched per-word)` | Damerau-Levenshtein within budget |

Boundary and rhythm bonuses refine the scores inside a tier:

- query at target start: `+8`; right after a separator (`-`, `_`, `.`, `/`,
  space, `:`, `@`): `+6`.
- consecutive matched characters: `+4` per extra consecutive character.

### typo tolerance rules

- Only reached when no structural match exists.
- Queries shorter than **3 characters never typo-match** (`'ab'` vs
  `'ollama'` → `null`) — short queries must be accurate.
- Allowed distance scales with query length: 1 edit for queries < 6 chars,
  2 edits for 6+.
- If the whole target is not within budget, each separator-delimited word of
  the target is checked (`'qwen25-vl'` → typo of the word `qwen2.5` inside
  `qwen2.5-vl:7b`); word-level matches get `+6`.

### examples (asserted in `tests/fuzzy-search.test.ts`)

| query | target | why it matches |
|---|---|---|
| `gemini` | `Gemini` | exact beats substring |
| `gemini` | `Gemini 2.5 Pro` | substring |
| `gemni` | `gemini-2.5-pro` | 1 deletion, within budget |
| `gemeni` | `gemini-2.5-pro` | transposition (Damerau), within budget |
| `vicion` | `vision` | 1 substitution |
| `qwen vl` | `qwen2.5-vl:7b` | token subsequence across separators |
| `embed` | `nomic-embed-text` | token substring after `-` boundary |
| `xyz` | `gemini-2.5-pro` | `null` — no structural or typo match |

Result ordering favors precision: prefixes of words rank above distant typos
(`searchScore('embed', 'embeddings-task')` > `searchScore('embed', 'gemma-27b-text')`),
and `Combobox` breaks score ties alphabetically by label.

### app-side reuse

Anywhere the family ranks user input against ids/labels (e.g. searching a
model catalog in app state, a palette, a command menu):

```ts
import { searchScore } from '@neuronection/assistant-ui'

const entries = [{ id: 'qwen2.5-vl:7b', label: 'Qwen 2.5 VL 7B' }]

export function lookup(query: string) {
  return entries
    .flatMap((entry) => {
      const score = Math.max(
        searchScore(query, entry.label) ?? -1,
        searchScore(query, entry.id) ?? -1,
      )
      return score >= 0 ? [{ ...entry, score }] : []
    })
    .sort((a, b) => b.score - a.score)
}
```

Scoring is synchronous and allocation-light; safe to run per keystroke.

## `cn`

```ts
import { cn } from '@neuronection/assistant-ui'

cn('px-2 py-1', cond && 'bg-[var(--as-primary)]', className)
```

`clsx` + `tailwind-merge`: conditional classes plus conflict resolution — a
later `className` prop replaces only the conflicting utilities, never the
component's own. This is the merge contract for every component (`className`
merges, never replaces).

## tokens entry point

`@neuronection/assistant-ui/tokens` (also re-exported from the root) exports
the token name lists and types that `ThemeScope` consumes:

```ts
import {
  rawTokens,        // '--as-tone-0' … '--as-accent', '--as-ai' (private tier)
  semanticTokens,   // '--as-primary' … '--as-shadow-3' (public tier)
} from '@neuronection/assistant-ui/tokens'
```

Types: `RawTokenName`, `SemanticTokenName`, `ThemeTokenName` (union),
`ThemeTokens` = `Partial<Record<ThemeTokenName, string>>`. Use them to
validate a theme object at compile time:

```ts
import type { ThemeTokens } from '@neuronection/assistant-ui/tokens'

const seasonal: ThemeTokens = { '--as-primary': 'oklch(0.6 0.14 40)' }
```

The full token semantics (two-tier architecture, dark mode, z-index tokens)
are documented in [../theming.md](../theming.md).
