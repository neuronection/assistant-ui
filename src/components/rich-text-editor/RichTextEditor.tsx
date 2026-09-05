import * as React from 'react'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { Markdown } from 'tiptap-markdown'

import { cn } from '../../lib/utils'

export type RichTextToolbarGroup = 'history' | 'heading' | 'format' | 'list' | 'quote'

const DEFAULT_TOOLBAR: RichTextToolbarGroup[] = [
  'history',
  'heading',
  'format',
  'list',
  'quote',
]

export interface RichTextEditorLabels {
  toolbar?: string
  bold?: string
  italic?: string
  strike?: string
  code?: string
  heading?: string
  bulletList?: string
  orderedList?: string
  blockquote?: string
  undo?: string
  redo?: string
}

export interface RichTextEditorIcons {
  bold?: LucideIcon
  italic?: LucideIcon
  strike?: LucideIcon
  code?: LucideIcon
  heading?: LucideIcon
  bulletList?: LucideIcon
  orderedList?: LucideIcon
  blockquote?: LucideIcon
  undo?: LucideIcon
  redo?: LucideIcon
}

const DEFAULT_LABELS: Required<RichTextEditorLabels> = {
  toolbar: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  strike: 'Strikethrough',
  code: 'Code',
  heading: 'Heading',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  blockquote: 'Quote',
  undo: 'Undo',
  redo: 'Redo',
}

const DEFAULT_ICONS: Required<RichTextEditorIcons> = {
  bold: Bold,
  italic: Italic,
  strike: Strikethrough,
  code: Code,
  heading: Heading2,
  bulletList: List,
  orderedList: ListOrdered,
  blockquote: Quote,
  undo: Undo2,
  redo: Redo2,
}

export interface RichTextEditorProps {
  value: string
  onValueChange: (markdown: string) => void
  ariaLabel: string
  disabled?: boolean
  toolbar?: RichTextToolbarGroup[] | false
  toolbarExtra?: React.ReactNode
  labels?: Partial<RichTextEditorLabels>
  icons?: Partial<RichTextEditorIcons>
  className?: string
}

function getMarkdown(editor: Editor): string {
  const storage = editor.storage as { markdown?: { getMarkdown?: () => string } }
  return storage.markdown?.getMarkdown?.() ?? ''
}

function applyExternalValue(editor: Editor, markdown: string): void {
  const hadFocus = editor.isFocused
  const caret = editor.state.selection.head
  editor.commands.setContent(markdown, { emitUpdate: false })
  if (hadFocus) {
    editor.commands.setTextSelection(Math.min(caret, editor.state.doc.content.size))
    editor.commands.focus()
  }
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      onValueChange,
      ariaLabel,
      disabled = false,
      toolbar = DEFAULT_TOOLBAR,
      toolbarExtra,
      labels,
      icons,
      className,
    },
    ref,
  ) {
    const mergedLabels = { ...DEFAULT_LABELS, ...labels }
    const mergedIcons = { ...DEFAULT_ICONS, ...icons }
    const lastEmittedRef = React.useRef<string>(value)
    const onValueChangeRef = React.useRef(onValueChange)
    onValueChangeRef.current = onValueChange
    const [, bump] = React.useReducer((count: number) => count + 1, 0)

    const editor = useEditor(
      {
        extensions: [StarterKit, Markdown],
        content: value,
        editable: !disabled,
        immediatelyRender: false,
        editorProps: {
          attributes: {
            'aria-label': ariaLabel,
            class:
              'as-rich-text-editor__content min-h-24 w-full bg-transparent px-3 py-2 text-sm text-[var(--as-fg)] outline-none',
          },
        },
        onUpdate: ({ editor: current }) => {
          const markdown = getMarkdown(current)
          lastEmittedRef.current = markdown
          onValueChangeRef.current(markdown)
        },
      },
    )

    const isMounted = editor !== null

    React.useEffect(() => {
      if (!isMounted || editor === null) {
        return
      }
      const handler = () => bump()
      editor.on('transaction', handler)
      editor.on('update', handler)
      return () => {
        editor.off('transaction', handler)
        editor.off('update', handler)
      }
    }, [editor, isMounted])

    React.useEffect(() => {
      if (editor === null || editor.isDestroyed) {
        return
      }
      editor.setEditable(!disabled)
    }, [editor, disabled])

    React.useEffect(() => {
      if (editor === null || editor.isDestroyed) {
        return
      }
      if (value === lastEmittedRef.current) {
        return
      }
      const current = getMarkdown(editor)
      if (value === current) {
        lastEmittedRef.current = value
        return
      }
      applyExternalValue(editor, value)
      lastEmittedRef.current = value
    }, [editor, value])

    const groups = toolbar === false ? [] : (toolbar ?? DEFAULT_TOOLBAR)

    const renderButton = (
      key: Exclude<keyof RichTextEditorLabels, 'toolbar'>,
      group: Exclude<RichTextToolbarGroup, 'history'> | 'history',
      onClick: () => void,
      active: boolean,
    ) => {
      const Icon = mergedIcons[key]
      return (
        <button
          key={`${group}-${key}`}
          type="button"
          aria-label={mergedLabels[key]}
          aria-pressed={active}
          title={mergedLabels[key]}
          disabled={disabled}
          className={cn(
            'rounded p-1.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
            active && 'bg-[var(--as-surface-active)] text-[var(--as-fg)]',
          )}
          onClick={onClick}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      )
    }

    return (
      <div
        ref={ref}
        data-as="rich-text-editor"
        className={cn(
          'w-full rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-fg)] focus-within:border-[var(--as-focus-ring)]',
          disabled && 'opacity-50',
          className,
        )}
      >
        {groups.length > 0 || toolbarExtra ? (
          <div
            role="toolbar"
            aria-label={mergedLabels.toolbar}
            className="flex flex-wrap items-center gap-0.5 border-b border-[var(--as-border)] p-1"
          >
            {groups.includes('history')
              ? renderButton(
                  'undo',
                  'history',
                  () => editor?.chain().focus().undo().run(),
                  false,
                )
              : null}
            {groups.includes('history')
              ? renderButton(
                  'redo',
                  'history',
                  () => editor?.chain().focus().redo().run(),
                  false,
                )
              : null}
            {groups.includes('heading')
              ? renderButton(
                  'heading',
                  'heading',
                  () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                  editor?.isActive('heading', { level: 2 }) === true,
                )
              : null}
            {groups.includes('format')
              ? renderButton(
                  'bold',
                  'format',
                  () => editor?.chain().focus().toggleBold().run(),
                  editor?.isActive('bold') === true,
                )
              : null}
            {groups.includes('format')
              ? renderButton(
                  'italic',
                  'format',
                  () => editor?.chain().focus().toggleItalic().run(),
                  editor?.isActive('italic') === true,
                )
              : null}
            {groups.includes('format')
              ? renderButton(
                  'strike',
                  'format',
                  () => editor?.chain().focus().toggleStrike().run(),
                  editor?.isActive('strike') === true,
                )
              : null}
            {groups.includes('format')
              ? renderButton(
                  'code',
                  'format',
                  () => editor?.chain().focus().toggleCode().run(),
                  editor?.isActive('code') === true,
                )
              : null}
            {groups.includes('list')
              ? renderButton(
                  'bulletList',
                  'list',
                  () => editor?.chain().focus().toggleBulletList().run(),
                  editor?.isActive('bulletList') === true,
                )
              : null}
            {groups.includes('list')
              ? renderButton(
                  'orderedList',
                  'list',
                  () => editor?.chain().focus().toggleOrderedList().run(),
                  editor?.isActive('orderedList') === true,
                )
              : null}
            {groups.includes('quote')
              ? renderButton(
                  'blockquote',
                  'quote',
                  () => editor?.chain().focus().toggleBlockquote().run(),
                  editor?.isActive('blockquote') === true,
                )
              : null}
            {toolbarExtra}
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    )
  },
)
