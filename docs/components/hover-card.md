# HoverCard

Rich preview surfaced by hover or keyboard-focus intent, with grace delays so
accidental pointer passes don't fire. The trigger is focusable (Tab opens the
card); Escape or blur closes it. Pair with the app's data layer for preview
content — the primitive has no data concerns (ADR-006).

## import

```ts
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardPortal,
} from '@neuronection/assistant-ui/hover-card'
```

## props

`HoverCard` re-exports the Radix root with grace defaults:

| prop | type | default | notes |
|---|---|---|---|
| `openDelay` | `number` | `150` | ms of hover/focus before opening |
| `closeDelay` | `number` | `100` | grace before closing on leave |
| `open` / `onOpenChange` | — | uncontrolled | controlled-first contract |

`HoverCardContent` extends the Radix content props:

| prop | type | default | notes |
|---|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | alignment to the trigger |
| `sideOffset` | `number` | `6` | gap from the trigger |
| `className` | `string` | — | merges (default width `w-72`) |

## controlled contract

Uncontrolled by default; pass `open` + `onOpenChange` to own the state (e.g.
to gate rendering or fetch on open). `onOpenChange(open)` fires on hover,
focus and close intent.

## labels & i18n

No built-in labels — content is app data; apps translate at call sites.

## accessibility

- Trigger is a real focusable element; opening works from keyboard focus
  alone (asserted in tests), so the preview is reachable without a pointer.
- Escape closes; focus management and `aria-describedby` wiring come from
  Radix primitives.
- Content is rendered in a portal with `data-as="hover-card"`; surface
  styling rides `--as-*` tokens (dark-mode safe via app remaps).
- Touch: hover events don't fire for coarse pointers; apps that must
  guarantee no hover hijack on touch gate the wrapper on
  `matchMedia('(pointer: coarse)')`.

## examples

minimal:

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <button>report.pdf</button>
  </HoverCardTrigger>
  <HoverCardContent>2 min read · calculus</HoverCardContent>
</HoverCard>
```

realistic (preview with fetch-on-open, app side):

```tsx
<HoverCard openDelay={150} onOpenChange={(open) => open && prefetch(id)}>
  <HoverCardTrigger asChild>
    <span className="cursor-pointer underline decoration-dotted">{title}</span>
  </HoverCardTrigger>
  <HoverCardContent>
    <p className="line-clamp-3 text-sm">{summary}</p>
    <div className="mt-2 flex gap-1">{topics.map((topic) => <Badge key={topic}>{topic}</Badge>)}</div>
  </HoverCardContent>
</HoverCard>
```

## related

[`tooltip`](./tooltip.md) (short text hints — no interactive content),
[`popover`](./popover.md) (click-gated surfaces with forms/menus),
[`spinner`](./spinner.md) (verb-level waiting inside a preview).
