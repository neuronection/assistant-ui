# CommandList

Inline, controlled command listbox: grouped items, a search field, per-group
fuzzy or app-owned filtering, keywords, disabled semantics, an IME-safe
keyboard contract and a result-count live region. It is **not** a modal — it
owns no overlay and no focus trap. Wrap it in
[`CommandPalette`](./command-palette.md) (or your own `Modal`) when you need
the `Ctrl/Cmd+K` surface.

The library owns the shell; the app owns the catalog, ordering, permission
filtering, async search, deep links and action execution.

## import

```ts
import {
  CommandList,
  type CommandItem,
  type CommandGroup,
  type CommandSelectContext,
  type CommandListLabels,
} from '@neuronection/assistant-ui/command-list'
```

## item and group shapes

```ts
type CommandItem = {
  id: string
  label: string
  hint?: string
  icon?: LucideIcon
  keywords?: string[]
  shortcut?: string
  disabled?: boolean
  disabledReason?: string
}

type CommandGroup = {
  id: string
  label: string
  items: CommandItem[]
  filter?: 'none' | 'fuzzy'
}
```

`id` must be unique across every group — it is the active/selection key.
`keywords` are searched alongside `label` and `hint`. `shortcut` is a display
string already formatted by the app (the library does not parse chords).

## props — CommandList

| prop | type | default | notes |
|---|---|---|---|
| `query` | `string` | — | controlled search text |
| `onQueryChange` | `(query: string) => void` | — | fires per keystroke |
| `groups` | `CommandGroup[]` | — | app-ordered groups; empty groups are hidden |
| `onSelect` | `(item, context: { groupId, query }) => void` | — | fires for enabled items only (Enter, Tab in `select` mode, click) |
| `labels` | `CommandListLabels` | — | `{ title?, placeholder?, empty?, results? }` |
| `activeId` | `string` | — | controlled active item; omit for internal state |
| `onActiveIdChange` | `(id: string) => void` | — | reports arrow/Home/End moves and filter resets |
| `tabBehavior` | `'select' \| 'focus'` | `'select'` | inline `select` picks the active item on Tab; modal wrappers pass `focus` |
| `className` | `string` | — | merges on the root |

## labels

| label | default | notes |
|---|---|---|
| `title` | — | optional inline heading; also the search field's accessible name |
| `placeholder` | `'Search commands…'` | search field placeholder |
| `empty` | `'No matching commands.'` | shown when nothing matches |
| `results` | `'{count} results'` | live-region text; `{count}` is replaced with the visible count |

All strings are props with English defaults — pass translated labels at the
call site. The docs accessibility row is the tested contract.

## filtering

- Groups default to `filter: 'fuzzy'`; the library keeps the app's item order
  and matches `label`, `hint` and `keywords` with
  [`searchScore`](../guides/utilities.md#fuzzy-search-searchscore-fuzzyscore).
- `filter: 'none'` leaves the group untouched by the query. Use it for
  async content search the app already filtered, and for app-ordered recents.
- When filtering removes the active item, the component reports the first
  visible enabled item through `onActiveIdChange` and moves
  `aria-activedescendant` there.
- Disabled items stay visible (with their `disabledReason`) but are skipped by
  keyboard navigation and never fire `onSelect`.

## examples

minimal inline list:

```tsx
<CommandList
  query={query}
  onQueryChange={setQuery}
  groups={groups}
  onSelect={(item, { groupId, query }) => run(item.id, { groupId, query })}
  labels={{ placeholder: t('commands.search') }}
/>
```

realistic — async results stay app-owned:

```tsx
const groups = [
  {
    id: 'results',
    label: t('commands.results'),
    filter: 'none',
    items: results.map((row) => ({ id: row.id, label: row.title, hint: row.subtitle })),
  },
  { id: 'actions', label: t('commands.actions'), items: actions },
]

<CommandList
  query={query}
  onQueryChange={onQueryChange}
  groups={groups}
  onSelect={handleSelect}
  activeId={activeId}
  onActiveIdChange={setActiveId}
  labels={{ empty: t('commands.empty'), results: t('commands.count') }}
/>
```

## reference configuration — study feature map

The study `?` dialog builds its **Capture · Read · Practise · Review ·
Organise · Configure** feature map app-side from its verb catalog; the library
ships no feature-map builder. The map is just a `CommandGroup[]`:

```tsx
const featureMap: CommandGroup[] = [
  { id: 'capture', label: t('featureMap.capture'), items: captureItems },
  { id: 'read', label: t('featureMap.read'), items: readItems },
  { id: 'practise', label: t('featureMap.practise'), items: practiseItems },
  { id: 'review', label: t('featureMap.review'), items: reviewItems },
  { id: 'organise', label: t('featureMap.organise'), items: organiseItems },
  { id: 'configure', label: t('featureMap.configure'), items: configureItems },
]

<CommandList
  query={query}
  onQueryChange={setQuery}
  groups={featureMap}
  onSelect={(item) => navigate(item.id)}
  labels={{ placeholder: t('featureMap.find') }}
  tabBehavior="focus"
/>
```

## accessibility

See [accessibility.md](../accessibility.md#composite-widgets): combobox +
listbox + option + group roles, `aria-controls`, `aria-activedescendant`,
`aria-autocomplete="list"`, ArrowUp/Down (wrap, skipping disabled), Home/End,
Enter, Tab per `tabBehavior`, IME composition guard, result-count and
empty-state live regions.

## related

[`CommandPalette`](./command-palette.md), [`ShortcutList`](./shortcut-list.md),
[`Combobox`](./combobox.md), [`Modal`](./modal.md).
