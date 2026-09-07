export interface ChatExportMessage {
  role: string
  content: string
}

export interface ChatExportOptions {
  /** Role label for user messages. Default `You`. */
  userLabel?: string
  /** Role label for assistant messages. Default `Assistant`. */
  assistantLabel?: string
  /** `bold` renders `**You:**` (career style); `heading` renders `### 🙋 Question` (study style). */
  roleStyle?: 'bold' | 'heading'
  /**
   * Per-message annotation lines rendered as blockquotes directly after
   * the content (career: referenced jobs/postings; study: citations).
   */
  annotations?: (message: ChatExportMessage, index: number) => string[]
}

function roleLabel(role: string, options: ChatExportOptions): string {
  if (role === 'user') {
    return options.userLabel ?? 'You'
  }
  if (role === 'assistant') {
    return options.assistantLabel ?? 'Assistant'
  }
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/**
 * Conversation → Markdown builder (career's `buildChatMarkdown` + study's
 * `messagesToMarkdown`, generalized): title header, one labelled section
 * per message, app-supplied blockquote annotations. Pure — no DOM.
 */
export function buildChatMarkdown(
  title: string,
  messages: ChatExportMessage[],
  options: ChatExportOptions = {},
): string {
  const heading = options.roleStyle === 'heading'
  const lines: string[] = [`# ${title}`, '']
  messages.forEach((message, index) => {
    const who = roleLabel(message.role, options)
    if (heading) {
      lines.push(`### ${who}`, '', message.content)
    } else {
      lines.push(`**${who}:**`, '', message.content)
    }
    for (const annotation of options.annotations?.(message, index) ?? []) {
      lines.push(`> ${annotation}`)
    }
    lines.push('')
  })
  return `${lines.join('\n').trimEnd()}\n`
}

/** Slugged `.md` file name for a chat title (`My Chat!` → `my-chat.md`). */
export function chatExportFileName(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${slug || 'chat'}.md`
}

/** Client-side download of the built markdown (blob + object URL). */
export function downloadChatMarkdown(markdown: string, fileName: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
