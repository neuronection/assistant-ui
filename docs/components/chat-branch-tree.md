# ChatBranchTree

The OpenWebUI-style conversation tree rail (study's `BranchTreePanel`
generalized): recursive commit-graph rows over the family branch-tree
contract — filled dots on the active path, hollow dots for hidden
variants, fork badges with child counts, role icons, truncated excerpts.
Click flips exactly one pointer (the family `select` endpoint,
level-flip semantics — no ancestor-chain activation).

## import

```ts
import { ChatBranchTree } from '@neuronection/assistant-ui/chat-branch-tree'
```

## props

| Prop | Type | Description |
| --- | --- | --- |
| `tree` | `BranchTree` | From `buildBranchTree` (server `/tree` projection) or `linearTree` (linear backends). |
| `activeIds` | `Set<string>` | Override the pointer-walk active set. |
| `onSelect` | `(nodeId) => void` | Node click / Enter. |
| `maxExcerpt` | `number` | Excerpt cap. Default `100`. |
| `icons` / `labels` | | user/assistant/fork icons; tree + forked strings. |

## example (realistic)

```tsx
<PopoverButton label="Branches" trigger={<GitBranch className="size-4" />}>
  <ChatBranchTree tree={tree} onSelect={(id) => selectVariant(id)} />
</PopoverButton>
```

## accessibility

`role="tree"` with `role="treeitem"` rows (`aria-selected` on the active
path, `aria-level` nesting, `role="group"` children); roving tabindex
with ArrowUp/Down/Home/End navigation; Enter/Space selects. Keyboard
flows tested.

## related

[`chat-core`](./chat-core.md) (`buildBranchTree`, `walkActivePath`),
[`chat-message`](./chat-message.md) (`MessageVariantSwitcher`),
[`popover-button`](./popover-button.md).
