import { useState } from 'react'
import { FilePlus2, FolderSearch, Settings2, Upload } from 'lucide-react'

import {
  CommandList,
  type CommandGroup,
} from '../src/components/command-list'

const groups: CommandGroup[] = [
  {
    id: 'capture',
    label: 'Capture',
    items: [
      {
        id: 'new-note',
        label: 'New note',
        hint: 'Start a blank note',
        icon: FilePlus2,
        keywords: ['write', 'create'],
        shortcut: 'N',
      },
      {
        id: 'import',
        label: 'Import material',
        hint: 'Upload a PDF or document',
        icon: Upload,
        keywords: ['upload', 'pdf'],
      },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    items: [
      {
        id: 'browse-library',
        label: 'Browse library',
        hint: 'Open every saved material',
        icon: FolderSearch,
        keywords: ['search', 'notes'],
      },
      {
        id: 'archived',
        label: 'Archived notes',
        hint: 'Restore or delete archived notes',
        icon: Settings2,
        disabled: true,
        disabledReason: 'Available in the archive view',
      },
    ],
  },
]

const frame = {
  width: 420,
  borderRadius: 'var(--as-radius-lg)',
  border: '1px solid var(--as-border)',
  background: 'var(--as-surface-raised)',
} as const

export const Default = () => {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  return (
    <div style={frame}>
      <CommandList
        query={query}
        onQueryChange={setQuery}
        groups={groups}
        activeId={activeId}
        onActiveIdChange={setActiveId}
        onSelect={() => {}}
        labels={{ title: 'Commands', placeholder: 'Search commands…' }}
      />
    </div>
  )
}

export const Empty = () => {
  const [query, setQuery] = useState('zzz')
  return (
    <div style={frame}>
      <CommandList
        query={query}
        onQueryChange={setQuery}
        groups={groups}
        onSelect={() => {}}
        labels={{ empty: 'No commands match that search.', results: '{count} results' }}
      />
    </div>
  )
}

const asyncGroups: CommandGroup[] = [
  {
    id: 'results',
    label: 'Search results',
    filter: 'none',
    items: [
      { id: 'result-1', label: 'Photosynthesis — chapter 4', hint: 'Matched in your notes' },
      { id: 'result-2', label: 'Cell respiration summary', hint: 'Matched in your notes' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'search-all', label: 'Search all materials', icon: FolderSearch },
    ],
  },
]

export const AsyncGroup = () => {
  const [query, setQuery] = useState('respiration')
  return (
    <div style={frame}>
      <CommandList
        query={query}
        onQueryChange={setQuery}
        groups={asyncGroups}
        onSelect={() => {}}
        labels={{ title: 'Search', results: '{count} results' }}
      />
    </div>
  )
}
