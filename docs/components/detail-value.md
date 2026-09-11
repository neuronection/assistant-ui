# DetailValue

Internal building block for parsed detail payloads (used by
`chat-tool-card` and `chat-trace-timeline` — import via those modules):
JSON strings render as a **structured pane** — objects as `key: value`
rows, arrays as value chips, non-JSON payloads as preformatted text.
Display-only (ADR-006): the text in, this view out.

## wiring

UI modules import it directly (the `Spinner` pattern):

```ts
import { DetailValue } from '../detail-value/DetailValue'
```

## rendering contract

| payload | rendering |
|---|---|
| JSON object | `key: value` rows (`dt` muted key, `dd` right-aligned value), scrollable |
| JSON array | wrapped value chips |
| other/invalid JSON | preformatted text pane |

Rows and chips scroll at `max-h-40`; empty objects/arrays render nothing.

## accessibility

See [accessibility.md](./accessibility.md) — informational content only.

## related modules

- [`chat-tool-card`](./chat-tool-card.md) — uses it for args/result panes.
- [`chat-trace-timeline`](./chat-trace-timeline.md) — uses it for the
  row detail region.
