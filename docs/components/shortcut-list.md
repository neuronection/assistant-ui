# ShortcutList

Presentational, grouped keyboard-shortcut list. It renders section headings,
labels and `<kbd>` keycaps; it owns no shell, no title/footer, no close
button, no query, no platform detection and no chord registry. Compose it
inside a library [`Modal`](./modal.md) (study) or an app-owned in-flow sheet
with its own header/footer (desktop).

## import

```ts
import {
  ShortcutList,
  type ShortcutEntry,
  type ShortcutGroup,
} from '@neuronection/assistant-ui/shortcut-list'
```

## shapes

```ts
type ShortcutEntry = {
  id: string
  label: string
  keys: string
  disabled?: boolean
}

type ShortcutGroup = {
  id: string
  label: string
  entries: ShortcutEntry[]
}
```

`keys` is a display string the app has already formatted for its platform
(`"Ctrl K"`, `"⌘K"`, `"?"`); the library never parses or remaps chords.
Groups with no entries are omitted. Disabled entries stay visible and keep
their keycap; they carry `aria-disabled="true"` and muted text rather than
being removed.

## props — ShortcutList

| prop | type | default | notes |
|---|---|---|---|
| `groups` | `ShortcutGroup[]` | — | ordered sections with entries |
| `className` | `string` | — | merges on the root |

## examples

```tsx
<ShortcutList
  groups={[
    {
      id: 'global',
      label: t('shortcuts.global'),
      entries: [
        { id: 'palette', label: t('shortcuts.palette'), keys: 'Ctrl K' },
        { id: 'help', label: t('shortcuts.help'), keys: '?' },
      ],
    },
  ]}
/>
```

Inside the study `?` dialog, the app composes one `Modal` containing
`ShortcutList` and a feature-map `CommandList` — never a modal inside a
hand-rolled overlay.

## accessibility

See [accessibility.md](../accessibility.md#navigation--structure): each group
is a `section` labelled by its heading, entries are `ul`/`li` rows, keycaps
are `<kbd>` text, and disabled entries keep their label with
`aria-disabled="true"`.

## related

[`CommandList`](./command-list.md), [`CommandPalette`](./command-palette.md),
[`Modal`](./modal.md).
