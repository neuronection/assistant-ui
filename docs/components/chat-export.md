# chat-export

Conversation → Markdown export (career's `buildChatMarkdown` + study's
`messagesToMarkdown`, generalized): title header, one labelled section per
message (`**You:**` bold style or `### 🙋 Question` heading style), and
app-supplied blockquote annotations (career: referenced jobs/postings;
study: citations). Pure builder + slug file name + blob download helper —
fetching stays app-side.

## import

```ts
import {
  buildChatMarkdown,
  chatExportFileName,
  downloadChatMarkdown,
} from '@neuronection/assistant-ui/chat-export'
```

## API

| Export | Signature | Description |
| --- | --- | --- |
| `buildChatMarkdown` | `(title, messages: ChatExportMessage[], options?: ChatExportOptions) => string` | The markdown document. |
| `ChatExportMessage` | `{ role: string, content: string }` | App messages map onto this (raw rows work). |
| `ChatExportOptions` | `userLabel?`, `assistantLabel?`, `roleStyle?: 'bold' \| 'heading'`, `annotations?: (message, index) => string[]` | Labels default `You`/`Assistant`; annotations render as `> …` lines after the content. |
| `chatExportFileName` | `(title: string) => string` | Slugged `.md` name (`My Chat!` → `my-chat.md`, 60-char cap, `chat.md` fallback). |
| `downloadChatMarkdown` | `(markdown: string, fileName: string) => void` | Blob + object-URL anchor download (browser only). |

## label / i18n contract

Role labels are plain strings via options; apps translate at the call
site. Unknown roles render capitalized as-is.

## snippets

```ts
import { buildChatMarkdown, chatExportFileName, downloadChatMarkdown } from '@neuronection/assistant-ui/chat-export'
import { fetchMessages } from './api'

export async function exportChat(sessionId: string, title: string) {
  const messages = await fetchMessages(sessionId)
  downloadChatMarkdown(
    buildChatMarkdown(title, messages, {
      assistantLabel: 'Career Assistant',
      annotations: (message) =>
        message.role === 'assistant'
          ? [`jobs: ${(message.metadata_json?.referenced_job_codes ?? []).join(', ')}`]
          : [],
    }),
    chatExportFileName(title),
  )
}
```

```ts
const markdown = buildChatMarkdown(title, messages, {
  roleStyle: 'heading',
  userLabel: '🙋 Question',
  assistantLabel: '🤖 Tutor',
})
```

## accessibility

Renders nothing — pure string/DOM-download utilities. Content is plain
markdown text.

## related

[`chat-session-list`](./chat-session-list.md) (the row action that
usually triggers the export), [`chat-tools-catalog`](./chat-tools-catalog.md).
