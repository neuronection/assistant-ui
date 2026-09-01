# Marquee

Rubber-band (drag) selection toolkit for grids/surfaces:
`useMarquee` (headless hook), `MarqueeSurface` (hook + Escape-clears
wrapper), `MarqueeBand` (visual band), plus geometry helpers
(`marqueeRect`, `hitTestIds`, `rectsIntersect`). **Pointer-only by design**
— keep a keyboard-reachable selection alternative (e.g. `CheckIndicator`).

## import

```ts
import {
  useMarquee,
  MarqueeSurface,
  MarqueeBand,
  marqueeRect,
  hitTestIds,
  rectsIntersect,
  type MarqueeSelection,
} from '@neuronection/assistant-ui/marquee'
```

## API

### `useMarquee(options)` → `{ band: Rect | null }`

| option | type | notes |
|---|---|---|
| `enabled` | `boolean` | gate the listeners |
| `containerRef` | `RefObject<HTMLElement \| null>` | selection surface |
| `getBaseSelection` | `() => Set<string>` | current selection (used as ctrl/meta base) |
| `onSelect` | `(ids: string[], phase: 'start' \| 'drag' \| 'end') => void` | hits per phase |

### `MarqueeSurface`

| prop | type | default | notes |
|---|---|---|---|
| `selection` | `MarqueeSelection` | — | `{ selected: Set<string>, set(ids), clear() }` |
| `clearBlocked` | `() => boolean` | — | block Escape-clear (e.g. while an input has focus) |
| `children` / div props | — | — | render items + the band |

### `MarqueeBand`

| prop | type | notes |
|---|---|---|
| `band` | `Rect \| null` | the rect from `useMarquee`; `null` renders nothing |

## controlled contract

Selection lives in the app (`Set<string>` of ids). Items opt in with
`data-selectable-id="<id>"`; interactive elements are excluded via the
`button, input, textarea, select, a, [data-selectable-id], [data-no-marquee]`
selector. A 4px drag threshold separates clicks from bands; plain mousedown
without drag clears, ctrl/meta-drag adds to the base selection, Escape
cancels an active band and `MarqueeSurface` Escape clears the selection.

## labels & i18n

None — geometry only.

## examples

minimal:

```tsx
<MarqueeSurface selection={{ selected, set, clear }}>
  {items.map((item) => (
    <div key={item.id} data-selectable-id={item.id}>{item.name}</div>
  ))}
</MarqueeSurface>
```

realistic (band + keyboard alternative, library pattern):

```tsx
const { band } = useMarquee({ enabled: true, containerRef, getBaseSelection, onSelect })

<MarqueeSurface selection={selection} clearBlocked={() => searchFocused}>
  {items.map((item) => (
    <div key={item.id} data-selectable-id={item.id}>
      <CheckIndicator checked={selected.has(item.id)} label={`Select ${item.name}`} onToggle={toggle} />
    </div>
  ))}
  <MarqueeBand band={band} />
</MarqueeSurface>
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
**pointer-only** — no keyboard mode; apps must keep a keyboard-reachable
selection alternative (e.g. `CheckIndicator` checkboxes on the same items).

## related

[`CheckIndicator`](./check-indicator.md), [`SelectionBar`](./selection-bar.md).
