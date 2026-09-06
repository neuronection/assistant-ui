# ChatSessionList

The session list beside a full-page chat (study's `ChatSessionList` +
health's history overlay, generalized): typo-tolerant fuzzy search
(`searchScore`), Today/Yesterday/Earlier grouping, relative timestamps,
active marking, per-row rename/delete/export actions that appear only
when the app provides the handlers.

## import

```ts
import { ChatSessionList } from '@neuronection/assistant-ui/chat-session-list'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `sessions` | `ChatSessionView[]` | `{ id, title, updatedAt?, meta? }`. |
| `activeId` | `string \| null` | Marks `aria-current`. |
| `onSelect` | `(id) => void` | Row click / Enter. |
| `onNew` / `onRename` / `onDelete` / `onExport` | `(id?) => void` | Optional actions; absent handlers render nothing. |
| `searchable` / `groupByDate` | `boolean` | Both default `true`. |
| `labels` / `icons` | | All strings; icon overrides. |

## example (realistic)

```tsx
<ChatSessionList
  sessions={sessions}
  activeId={sessionId}
  onSelect={openSession}
  onNew={newSession}
  onRename={openRename}
  onDelete={confirmDelete}
  onExport={exportMarkdown}
/>
```

## accessibility

`role="list"`/`listitem` rows with `aria-current` on the active session;
labelled search input (`role="searchbox"`); row actions are a labelled
`role="group"` revealed on hover AND `focus-within`; Enter/Space selects.
Keyboard flows tested.

## related

[`chat-panel`](./chat-panel.md), [`fuzzy`](../guides/utilities.md)
(`searchScore`).
