import * as React from 'react'
import { Editor, EditorContent, useEditor, type Extensions } from '@tiptap/react'
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

export type RichTextHeadingLevel = 1 | 2 | 3 | 4

const DEFAULT_TOOLBAR: RichTextToolbarGroup[] = [
  'history',
  'heading',
  'format',
  'list',
  'quote',
]

const DEFAULT_HEADING_LEVELS: RichTextHeadingLevel[] = [2]

const DEFAULT_EXTENSIONS: Extensions = [StarterKit, Markdown]

export interface RichTextEditorLabels {
  toolbar?: string
  bold?: string
  italic?: string
  strike?: string
  code?: string
  heading?: (level: number) => string
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
  heading: (level) => `Heading ${level}`,
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

type FormatKey =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'undo'
  | 'redo'

export interface RichTextEditorProps {
  value: string
  onValueChange: (markdown: string) => void
  ariaLabel: string
  disabled?: boolean
  toolbar?: RichTextToolbarGroup[] | false
  /** App-owned controls at the end of the toolbar; render-prop form receives the editor. */
  toolbarExtra?: React.ReactNode | ((editor: Editor | null) => React.ReactNode)
  /** Full override of the document extension set; default is `[StarterKit, Markdown]`. Apps declare their complete set. */
  extensions?: Extensions
  /** Extra classes for the editable region (merged after the built-ins via tailwind-merge). */
  contentClassName?: string
  /** Called once when the editor instance is created and again with `null` on destroy/unmount. */
  onReady?: (editor: Editor | null) => void
  /** Heading toggles rendered for the `heading` toolbar group, one button per level. */
  headingLevels?: RichTextHeadingLevel[]
  /** Map incoming app-domain markdown before it reaches the document. */
  parseMarkdown?: (markdown: string) => string
  /** Map the serialized document before it is emitted / echo-compared. */
  serializeMarkdown?: (markdown: string) => string
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
      extensions,
      contentClassName,
      onReady,
      headingLevels,
      parseMarkdown,
      serializeMarkdown,
      labels,
      icons,
      className,
    },
    ref,
  ) {
    const mergedLabels = { ...DEFAULT_LABELS, ...labels }
    const mergedIcons = { ...DEFAULT_ICONS, ...icons }
    const resolvedExtensions = React.useMemo(
      () => extensions ?? DEFAULT_EXTENSIONS,
      [extensions],
    )
    const levels = headingLevels ?? DEFAULT_HEADING_LEVELS
    const lastEmittedRef = React.useRef<string>(value)
    const onValueChangeRef = React.useRef(onValueChange)
    onValueChangeRef.current = onValueChange
    const onReadyRef = React.useRef(onReady)
    onReadyRef.current = onReady
    const hooksRef = React.useRef({ parseMarkdown, serializeMarkdown })
    hooksRef.current = { parseMarkdown, serializeMarkdown }
    const [, bump] = React.useReducer((count: number) => count + 1, 0)

    const toDocument = React.useCallback(
      (markdown: string) => (parseMarkdown ? parseMarkdown(markdown) : markdown),
      [parseMarkdown],
    )
    const toApp = React.useCallback(
      (markdown: string) => (serializeMarkdown ? serializeMarkdown(markdown) : markdown),
      [serializeMarkdown],
    )

    const editor = useEditor(
      {
        extensions: resolvedExtensions,
        content: toDocument(value),
        editable: !disabled,
        immediatelyRender: false,
        editorProps: {
          attributes: {
            'aria-label': ariaLabel,
            class: cn(
              'as-rich-text-editor__content min-h-24 w-full bg-transparent px-3 py-2 text-sm text-[var(--as-fg)] outline-none',
              contentClassName,
            ),
          },
        },
        onUpdate: ({ editor: current }) => {
          const markdown = toApp(getMarkdown(current))
          lastEmittedRef.current = markdown
          onValueChangeRef.current(markdown)
        },
      },
    )

    const isMounted = editor !== null

    React.useEffect(() => {
      if (editor === null) {
        return
      }
      onReadyRef.current?.(editor)
      return () => {
        onReadyRef.current?.(null)
      }
    }, [editor])

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

    const editableRef = React.useRef(!disabled)
    React.useEffect(() => {
      if (editor === null || editor.isDestroyed) {
        return
      }
      if (editableRef.current === !disabled) {
        return
      }
      editableRef.current = !disabled
      editor.setEditable(!disabled, false)
    }, [editor, disabled])

    React.useEffect(() => {
      if (editor === null || editor.isDestroyed) {
        return
      }
      if (value === lastEmittedRef.current) {
        return
      }
      const current = toApp(getMarkdown(editor))
      if (value === current) {
        lastEmittedRef.current = value
        return
      }
      applyExternalValue(editor, toDocument(value))
      lastEmittedRef.current = value
    }, [editor, value, toApp, toDocument])

    const groups = toolbar === false ? [] : (toolbar ?? DEFAULT_TOOLBAR)

    const buttonClass = (active: boolean) =>
      cn(
        'rounded p-1.5 text-[var(--as-muted-fg)] transition-colors hover:text-[var(--as-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        active && 'bg-[var(--as-surface-active)] text-[var(--as-fg)]',
      )

    const renderButton = (
      key: FormatKey,
      group: RichTextToolbarGroup,
      onClick: () => void,
      active: boolean,
      buttonDisabled = disabled,
    ) => {
      const Icon = mergedIcons[key]
      const label = mergedLabels[key]
      return (
        <button
          key={`${group}-${key}`}
          type="button"
          aria-label={label}
          aria-pressed={active}
          title={label}
          disabled={buttonDisabled}
          className={buttonClass(active)}
          onClick={onClick}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      )
    }

    const historyDisabled = (can: 'undo' | 'redo') =>
      disabled || editor === null || editor.can()[can]() !== true

    const renderHeadingButton = (level: RichTextHeadingLevel) => {
      const Icon = mergedIcons.heading
      const label = mergedLabels.heading(level)
      return (
        <button
          key={`heading-${level}`}
          type="button"
          aria-label={label}
          aria-pressed={editor?.isActive('heading', { level }) === true}
          title={label}
          disabled={disabled}
          className={buttonClass(editor?.isActive('heading', { level }) === true)}
          onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
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
                  historyDisabled('undo'),
                )
              : null}
            {groups.includes('history')
              ? renderButton(
                  'redo',
                  'history',
                  () => editor?.chain().focus().redo().run(),
                  false,
                  historyDisabled('redo'),
                )
              : null}
            {groups.includes('heading') ? levels.map((level) => renderHeadingButton(level)) : null}
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
            {typeof toolbarExtra === 'function' ? toolbarExtra(editor) : toolbarExtra}
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    )
  },
)
