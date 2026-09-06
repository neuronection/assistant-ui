export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessageStatus = 'streaming' | 'done' | 'error' | 'interrupted'

export interface ChatError {
  code: string
  message: string
  retryable: boolean
}

export interface ChatMessageVariants {
  /** 1-based position of this message among its siblings. */
  index: number
  count: number
  siblingIds: string[]
}

export interface ChatAttachmentView {
  id: string
  name: string
  kind: 'image' | 'file'
  /** Resolvable URL for previews (blob:, data:, or app API path). */
  url?: string
  meta?: Record<string, unknown>
}

/**
 * The normalized message every chat renderer in the library speaks. Apps map
 * their persisted rows onto this shape; unknown extras survive in `meta`.
 */
export interface ChatMessageView {
  id: string
  role: ChatRole
  /** Markdown body. */
  content: string
  /** Thinking-mode text (family `delta kind="reasoning"` accumulation). */
  reasoning?: string
  status: ChatMessageStatus
  error?: ChatError
  createdAt?: string | number
  /** Branch-tree linkage (family branching contract). */
  parentId?: string | null
  variants?: ChatMessageVariants
  attachments?: ChatAttachmentView[]
  /** App extension bag (trace refs, citations, chips…). */
  meta?: Record<string, unknown>
}
