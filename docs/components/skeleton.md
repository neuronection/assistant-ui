# Skeleton

Loading placeholders (`Skeleton` = one block, `SkeletonText` = a stack of text
lines) with a token-based shimmer sweep. Decorative by contract: every skeleton
is `aria-hidden`, and the shimmer stops entirely under
`prefers-reduced-motion` (leaving a static muted block). Mark the loading
**region** with `aria-busy` and announce it with visible text or a labeled
`Spinner` — the primitives themselves never announce.

## import

```ts
import { Skeleton, SkeletonText } from '@neuronection/assistant-ui/skeleton'
```

## props

`Skeleton` extends `React.ComponentProps<'div'>` (no extras — size and shape
come from `className`; `rounded-full size-10` makes a circle).

`SkeletonText` extends `React.ComponentProps<'div'>`:

| prop | type | default | notes |
|---|---|---|---|
| `lines` | `number` | `3` | line count, clamped to 1–12 |
| `lastLineRatio` | `number` | `0.8` | width of the last line as a ratio (clamped 0.1–1); ignored for a single line |
| `className` | `string` | — | merges onto the stack wrapper |

## controlled contract

None — presentational; mount/unmount is app loading state.

## labels & i18n

No labels — decorative. Visible "Loading…" text (app i18n key) belongs beside
or instead of the placeholders when the region needs announcement.

## accessibility

- Both primitives render `aria-hidden="true"` — they are shapes, not content.
- The recommended container pattern (tested in the story suite):
  wrap the placeholder area in the element that owns the loading state and set
  `aria-busy="true"` on it while skeletons show; swap `aria-busy` for real
  content when the data arrives.
- Non-interactive: no focus, no keyboard semantics.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables the sweep
  (static muted blocks remain).

## examples

minimal:

```tsx
<Skeleton className="h-4 w-40" />
```

realistic (list rows while a query loads):

```tsx
<div aria-busy={query.isLoading || undefined}>
  {query.isLoading ? (
    [0, 1, 2].map((row) => (
      <div key={row} className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))
  ) : (
    <ItemRows items={query.data} />
  )}
</div>
```

card placeholder:

```tsx
<Card>
  <CardHeader>
    <Skeleton className="mb-2 h-4 w-2/3" />
    <Skeleton className="h-3 w-1/3" />
  </CardHeader>
  <CardContent>
    <SkeletonText lines={4} />
  </CardContent>
</Card>
```

## related

[`spinner`](./spinner.md) (inline/verb-level waiting, announcing),
[`empty-state`](./empty-state.md) (the honest zero-data state that replaces
skeletons when loading finishes empty).
