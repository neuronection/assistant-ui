import { describe, expect, it, vi } from 'vitest'

import {
  buildChatMarkdown,
  chatExportFileName,
  downloadChatMarkdown,
} from '../src/components/chat-export'

const messages = [
  { role: 'user', content: 'find nursing jobs' },
  { role: 'assistant', content: 'Here are **matches**.' },
]

describe('buildChatMarkdown', () => {
  it('renders the bold role style with English defaults', () => {
    expect(buildChatMarkdown('My chat', messages)).toBe(
      [
        '# My chat',
        '',
        '**You:**',
        '',
        'find nursing jobs',
        '',
        '**Assistant:**',
        '',
        'Here are **matches**.',
        '',
      ].join('\n'),
    )
  })

  it('renders the heading role style with custom labels', () => {
    const markdown = buildChatMarkdown('Tutor', messages, {
      roleStyle: 'heading',
      userLabel: '🙋 Question',
      assistantLabel: '🤖 Tutor',
    })
    expect(markdown).toContain('# Tutor')
    expect(markdown).toContain('### 🙋 Question')
    expect(markdown).toContain('### 🤖 Tutor')
  })

  it('appends app-supplied blockquote annotations after the content', () => {
    const markdown = buildChatMarkdown('Refs', messages, {
      annotations: (message) =>
        message.role === 'assistant' ? ['jobs: NO-1210, NO-1300'] : [],
    })
    expect(markdown).toBe(
      [
        '# Refs',
        '',
        '**You:**',
        '',
        'find nursing jobs',
        '',
        '**Assistant:**',
        '',
        'Here are **matches**.',
        '> jobs: NO-1210, NO-1300',
        '',
      ].join('\n'),
    )
  })

  it('handles an empty conversation', () => {
    expect(buildChatMarkdown('Empty', [])).toBe('# Empty\n')
  })
})

describe('chatExportFileName', () => {
  it('slugs the title into a .md file name', () => {
    expect(chatExportFileName('My Chat!')).toBe('my-chat.md')
    expect(chatExportFileName('  ICU_Rotations 2026 ')).toBe('icu-rotations-2026.md')
  })

  it('caps the slug and falls back to chat', () => {
    expect(chatExportFileName('x'.repeat(80))).toBe(`${'x'.repeat(60)}.md`)
    expect(chatExportFileName('!!!')).toBe('chat.md')
  })
})

describe('downloadChatMarkdown', () => {
  it('downloads the markdown as a blob anchor', () => {
    const revoke = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:chat')
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = revoke as typeof URL.revokeObjectURL
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor)
    const appendChild = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(((node: unknown) => node) as typeof document.body.appendChild)

    downloadChatMarkdown('# hi\n', 'chat.md')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(anchor.download).toBe('chat.md')
    expect(anchor.click).toHaveBeenCalledTimes(1)
    expect(anchor.remove).toHaveBeenCalledTimes(1)
    expect(revoke).toHaveBeenCalledWith('blob:chat')
    createElement.mockRestore()
    appendChild.mockRestore()
  })
})
