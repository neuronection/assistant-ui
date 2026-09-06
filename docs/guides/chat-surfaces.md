# Chat surfaces — the adoption recipe

The shared chat layer (plan dev/plans/11, ADR-0009) serves all three
surfaces — **bubble, sidepanel, full page** — from the same modular
pieces. This guide assembles them; per-module reference lives in
[docs/components/](../components/chat-core.md).

## The module map

| Tier | Modules | Owns |
| --- | --- | --- |
| 2 — headless | `chat-core` | `useChatStream` (live-turn state machine), `ChatStreamEvent` vocabulary, `liveTurnReducer`, branch-tree utils |
| 1 — presentational | `chat-markdown`, `chat-message`, `chat-reasoning`, `chat-tool-card`, `chat-composer`, `chat-transcript`, `chat-branch-tree`, `chat-session-list` | everything users see and interact with |
| 3 — surface hosts | `chat-panel`, `chat-drawer`, `chat-launcher` | the three surface shells |

**Boundary (ADR-006):** transports (WS/SSE clients, auth), session stores,
persistence and upload endpoints stay app-side. The hook owns the live
turn only — after a terminal state the app refetches persisted messages
and calls `reset()`.

## The transport adapter (~50 lines, the only required app glue)

Map your stream onto the family §5 vocabulary
(`flow_started`/`node_*`/`delta {kind: text|reasoning}`/`interrupt`/
`flow_finished`/`flow_failed`, plus `tool_call`). Career's
`frontend/src/components/chat/chatTransport.ts` is the reference:

```tsx
const stream = useChatStream({
  transport: {
    send: ({ text }) => api.postChatMessage(sessionId, text), // resolves when accepted
    subscribe: ({ onEvent }) =>
      sse.subscribe(`chat:${sessionId}`, (e) => onEvent(mapToFamily(e))),
    stop: () => api.stopChatTurn(sessionId),
  },
  flushMs: 33,
})
```

Gotchas: accumulated deltas must be diffed into chunks server-side of the
adapter (`sent = accumulated.length`); an abort during `stop()` surfaces
as a rejected `send` — the hook already ignores it (user-stopped).

## The three surfaces

```tsx
// bubble — floating launcher → anchored panel
<ChatLauncher
  panel={<ChatPanel variant="bubble" title="Assistant"
    transcript={…} composer={…} footer="AI can make mistakes" />}
/>

// sidepanel — resizable drawer (width persisted app-side)
<ChatDrawer open={open} onOpenChange={setOpen}
  width={width} onWidthChange={setWidth}
  panel={<ChatPanel variant="sidebar" … />} />

// page — session list aside + wide panel
<div className="flex h-full gap-4">
  <aside><ChatSessionList sessions={sessions} activeId={id}
    onSelect={openSession} onNew={newSession} /></aside>
  <ChatPanel variant="page" … />
</div>
```

## The transcript + live tail

```tsx
<ChatTranscript
  items={messages}                       // ChatMessageView[] (persisted, active path)
  renderItem={(m) => (
    <ChatMessage key={m.id} role={m.role}
      content={<MarkdownSurface value={m.content} />}
      reasoning={m.reasoning ? <ChatReasoning text={m.reasoning} /> : null}
      actions={{ onCopy, onEdit, onRegenerate }}
      variants={m.variants} onSelectVariant={selectVariant} />
  )}
  live={stream.live ? (
    <ChatMessage role="assistant" status="streaming"
      content={<MarkdownSurface value={stream.text ?? ''} streaming />}
      reasoning={stream.reasoning !== null
        ? <ChatReasoning text={stream.reasoning} streaming /> : null} />
  ) : null}
  emptyState={<EmptyState title="Ask anything" />}
/>
```

`ChatTranscript` owns `role="log"`, polite turn-completion announcements,
stick-to-bottom and the jump pill — never hand-roll these.

## Branching (message versioning)

The family contract (study-proven, career-implemented):

- Backend: `chat_messages.parent_id` + `active_child_id`,
  `chat_sessions.active_root_id`; visible conversation = active-path walk
  (newest-sibling fallback).
- Endpoints: `POST …/edit` (branch a user message + rerun),
  `POST …/regenerate` (new assistant sibling), `POST …/select`
  (flip one pointer, level-flip semantics), `GET …/tree` (read-only
  projection).
- Frontend: decorate rows into `variants {index, count, siblingIds}` →
  `ChatMessage` renders the `‹ n/N ›` switcher; feed `/tree` through
  `buildBranchTree` into `ChatBranchTree` for the graph rail.
- Edit-and-resend routes the same live stream: set an intent on the
  transport before `stream.send(editedText)` (career's `beginEdit`
  pattern).

## Composer + slots for app features

`ChatComposer` covers the input; everything app-specific is a slot:

| App feature | Slot |
| --- | --- |
| attach menu, equation/draw/screenshot dialogs | `toolbarStart` / `toolbarEnd` |
| image/file attachments | `attachments` (+ `onAttachFiles` wires drag-drop + paste) |
| suggestion chips, context strip | `suggestions` |
| dictation | `toolbarEnd` + the [`dictation`](../components/dictation.md) module |
| HITL cards, tool inspectors | `ChatMessage` `children` slot |
| citations / internal links / mentions | `MarkdownSurface` `components.a` + `urlTransform` overrides |
| flow progress while the reply is pending | `FlowStatusCard` fed from `stream.nodes` |

## What NOT to rebuild here

Health's HITL handler registry and inspector, study's widget/plotly/
markmap renderers and trace timeline, career's deep-link logic — they stay
app-side, rendered through the slots above. Single-app features never
enter the library (two-app rule).
