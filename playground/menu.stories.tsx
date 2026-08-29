import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  ActionMenu,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from '../src/components/menu/Menu'
import { ContextMenu } from '../src/components/context-menu/ContextMenu'
import { Button } from '../src/components/button/Button'

export const ActionMenuStory = () => (
  <ActionMenu
    label="Item actions"
    trigger={<MoreHorizontal aria-hidden />}
    items={[
      { key: 'rename', label: 'Rename', icon: Pencil, onSelect: () => {} },
      { key: 'export', label: 'Export', onSelect: () => {} },
      { key: 'delete', label: 'Delete', icon: Trash2, danger: true, onSelect: () => {} },
    ]}
  />
)

export const CompoundMenu = () => (
  <Menu>
    <MenuTrigger asChild>
      <Button variant="outline">Library</Button>
    </MenuTrigger>
    <MenuContent>
      <MenuLabel>Actions</MenuLabel>
      <MenuItem onSelect={() => {}}>New note</MenuItem>
      <MenuItem onSelect={() => {}}>New folder</MenuItem>
      <MenuSeparator />
      <MenuItem danger onSelect={() => {}}>
        Empty trash
      </MenuItem>
    </MenuContent>
  </Menu>
)

export const ContextMenuStory = () => {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  return (
    <div
      onContextMenu={(event) => {
        event.preventDefault()
        setPoint({ x: event.clientX, y: event.clientY })
      }}
      style={{
        padding: 32,
        border: '1px dashed var(--as-border)',
        borderRadius: 8,
        maxWidth: 420,
      }}
    >
      <p className="text-sm">Right-click anywhere in this box.</p>
      {point !== null ? (
        <ContextMenu
          x={point.x}
          y={point.y}
          items={[
            { key: 'open', label: 'Open', onSelect: () => {} },
            { key: 'rename', label: 'Rename', onSelect: () => {} },
            { key: 'locked', label: 'Locked', disabled: true, hint: 'No permission' },
            { key: 'delete', label: 'Delete', danger: true, onSelect: () => {} },
          ]}
          onClose={() => setPoint(null)}
        />
      ) : null}
    </div>
  )
}
