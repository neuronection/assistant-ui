import { ShortcutList, type ShortcutGroup } from '../src/components/shortcut-list'

const groups: ShortcutGroup[] = [
  {
    id: 'global',
    label: 'Global',
    entries: [
      { id: 'palette', label: 'Command palette', keys: 'Ctrl K' },
      { id: 'shortcuts', label: 'Keyboard shortcuts', keys: '?' },
      { id: 'search', label: 'Search', keys: 'Ctrl F' },
    ],
  },
  {
    id: 'editor',
    label: 'Editor',
    entries: [
      { id: 'save', label: 'Save note', keys: 'Ctrl S' },
      { id: 'bold', label: 'Bold', keys: 'Ctrl B' },
      { id: 'italic', label: 'Italic', keys: 'Ctrl I', disabled: true },
    ],
  },
]

export const Default = () => (
  <div
    style={{
      width: 360,
      padding: 20,
      borderRadius: 'var(--as-radius-lg)',
      border: '1px solid var(--as-border)',
      background: 'var(--as-surface-raised)',
    }}
  >
    <ShortcutList groups={groups} />
  </div>
)
