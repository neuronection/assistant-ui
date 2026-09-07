# ChatToolsCatalog

Catalog of the tools an assistant can use (study's `ToolsDialog` body +
career's `/ai/tools` surface, generalized): searchable disclosure cards —
stable tool name (mono), human title, scope chip, and an expandable body
with description, a spec card per argument (mono name, type badge,
required/optional flag, description), example payload and response shape.
Presentational only: fetching and the surrounding modal/popover stay
app-side.

## import

```ts
import { ChatToolsCatalog } from '@neuronection/assistant-ui/chat-tools-catalog'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `tools` | `ChatToolCatalogEntry[]` | The catalog rows. |
| `tools[].name` | `string` | Stable tool identifier (mono header). |
| `tools[].title` | `string` | Human title; falls back to `name`. |
| `tools[].description` | `string` | Shown in the expanded body. |
| `tools[].arguments` | `ChatToolCatalogArgument[]` | `{ name, type?, required?, description? }` rows. |
| `tools[].example` / `.response` | `string` | Example payload (`pre`) and response description. |
| `tools[].scope` | `string` | Rendered as an uppercase chip in the header. |
| `searchable` | `boolean` | Fuzzy search over name/title/description (default `true`). |
| `defaultOpen` | `boolean` | Expand every entry initially (default `false`). |
| `labels` | `Partial<ChatToolsCatalogLabels>` | tools/search/searchPlaceholder/arguments/response/required/optional/empty/noResults. |
| `icon` | `LucideIcon` | Header icon, default `Wrench`. |

## controlled contract

Uncontrolled component: each entry's expanded state is local (seeded by
`defaultOpen`); search text is local. There is no per-entry `onOpenChange`
— apps needing a fully controlled disclosure should compose
[`ChatToolCard`](./chat-tool-card.md) instead.

## label / i18n contract

All strings come from `labels` with English defaults; apps translate at
the call site by passing the full partial. Entry names are data, never
translated.

## snippets

```tsx
import { useQuery } from '@tanstack/react-query'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@neuronection/assistant-ui/modal'
import { ChatToolsCatalog } from '@neuronection/assistant-ui/chat-tools-catalog'
import { fetchAiTools } from './api'

function ToolsDialog({ open, onOpenChange }) {
  const { data } = useQuery({ queryKey: ['ai-tools'], queryFn: fetchAiTools, enabled: open })
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Tools the assistant can use</ModalTitle>
        </ModalHeader>
        {data ? <ChatToolsCatalog tools={data.map(toolCatalogEntry)} /> : <Spinner />}
      </ModalContent>
    </Modal>
  )
}
```

```tsx
<ChatToolsCatalog tools={tools} searchable={false} defaultOpen />
```

## accessibility

Search input is a labelled `role="searchbox"`; entries form a labelled
`role="list"`; each header is a real button with `aria-expanded` +
`aria-controls` (Enter/Space toggles natively); the expanded region is
plain text content. Empty and no-results states are asserted text.
Clean under jest-axe collapsed, expanded and filtering.

## related

[`chat-tool-card`](./chat-tool-card.md) (per-call observation during a
turn), [`chat-session-list`](./chat-session-list.md),
[`chat-panel`](./chat-panel.md).
