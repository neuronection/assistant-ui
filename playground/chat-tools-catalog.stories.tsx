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

export const LongScopeAndName = () => (
  <div style={{ width: 420 }}>
    <ChatToolsCatalog
      tools={[
        {
          name: 'a_very_long_tool_identifier_without_separators_that_must_wrap_not_crop',
          title: 'A human title that is also quite long and keeps reading',
          description:
            'Header stays one visual row: the name wraps within its slot and a sentence-length scope value is capped with an ellipsis (full text on hover).',
          scope:
            'Read-only — lists the learner’s courses and node resources; also served to external agents via the MCP resource server.',
        },
        ...tools,
      ]}
    />
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
