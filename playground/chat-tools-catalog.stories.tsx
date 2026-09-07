import { ChatToolsCatalog, type ChatToolCatalogEntry } from '../src/components/chat-tools-catalog/ChatToolsCatalog'

const tools: ChatToolCatalogEntry[] = [
  {
    name: 'search_jobs',
    title: 'Searching the job catalog',
    description: 'Full-text search over the job catalog with structured filters.',
    arguments: [
      { name: 'query', type: 'string', required: true, description: 'What to look for.' },
      { name: 'limit', type: 'integer', description: 'Maximum number of results.' },
    ],
    example: '{"query": "nurse", "limit": 5}',
    response: 'JSON list of matching job refs.',
    scope: 'read',
  },
  {
    name: 'my_matches',
    title: 'My fit matches',
    description: 'Fit-scored catalog matches for the signed-in student.',
    response: 'JSON list of { ref, score } pairs.',
    scope: 'read',
  },
]

export const Default = () => (
  <div style={{ width: 420 }}>
    <ChatToolsCatalog tools={tools} />
  </div>
)

export const OpenAndFiltered = () => (
  <div style={{ width: 420 }}>
    <ChatToolsCatalog tools={tools} defaultOpen labels={{ searchPlaceholder: 'Filter tools…' }} />
  </div>
)

export const Empty = () => (
  <div style={{ width: 420 }}>
    <ChatToolsCatalog tools={[]} />
  </div>
)
