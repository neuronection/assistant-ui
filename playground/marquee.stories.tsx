import { useState } from 'react'
import { MarqueeSurface, type MarqueeSelection } from '../src/components/marquee/Marquee'

const items = [
  { id: 'one', label: 'Lecture 1' },
  { id: 'two', label: 'Lecture 2' },
  { id: 'three', label: 'Problem set' },
  { id: 'four', label: 'Summary' },
]

export const Default = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const selection: MarqueeSelection = {
    selected,
    set: (ids) => setSelected(new Set(ids)),
    clear: () => setSelected(new Set()),
  }
  return (
    <div style={{ maxWidth: 480 }}>
      <MarqueeSurface
        selection={selection}
        className="flex flex-wrap gap-3 rounded-[var(--as-radius-lg)] border border-dashed p-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-selectable-id={item.id}
            className="cursor-pointer rounded-[var(--as-radius)] border px-3 py-2 text-sm"
            style={{
              borderColor: selected.has(item.id)
                ? 'var(--as-primary)'
                : 'var(--as-border)',
              background: selected.has(item.id) ? 'var(--as-secondary)' : 'transparent',
            }}
            onClick={() =>
              setSelected((prev) => {
                const next = new Set(prev)
                if (next.has(item.id)) {
                  next.delete(item.id)
                } else {
                  next.add(item.id)
                }
                return next
              })
            }
          >
            {item.label}
          </div>
        ))}
      </MarqueeSurface>
      <p className="text-xs" style={{ marginTop: 8 }}>
        Drag over items to select; Ctrl-drag adds; Escape clears.
      </p>
    </div>
  )
}
