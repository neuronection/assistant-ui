import { useState } from 'react'
import { FilePlus2, FolderSearch, Upload } from 'lucide-react'

import { Button } from '../src/components/button/Button'
import { CommandPalette } from '../src/components/command-palette'
import type { CommandGroup } from '../src/components/command-list'

const groups: CommandGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new-note', label: 'New note', icon: FilePlus2, shortcut: 'N' },
      { id: 'import', label: 'Import material', icon: Upload, keywords: ['pdf', 'upload'] },
    ],
  },
  {
    id: 'navigate',
    label: 'Go to',
    items: [{ id: 'library', label: 'Library', icon: FolderSearch, hint: 'All materials' }],
  },
]

export const Default = () => {
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('')
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
        groups={groups}
        onSelect={() => setQuery('')}
        labels={{ placeholder: 'Type a command or search…' }}
      />
    </>
  )
}
