import * as React from 'react'
import { defaultUrlTransform, type Components, type Options as ReactMarkdownOptions, type UrlTransform } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '../../lib/utils'
import { Modal, ModalContent } from '../modal/Modal'
import { MarkdownCodeBlock, type MarkdownCodeBlockLabels } from './MarkdownCodeBlock'
import { extractText, MermaidDiagram } from './MermaidDiagram'

export type MarkdownComponents = Components
export type { MarkdownCodeBlockLabels }

export interface MarkdownSurfaceProps {
  /** Markdown source (model output is untrusted — raw HTML never renders). */
  value: string
  /** Live turn: defers mermaid to the final render (streaming floods break diagrams). */
  streaming?: boolean
  /** Search highlight: case-insensitive matches wrap in `<mark data-as="chat-search-match">`. */
  query?: string
  /** Click-to-zoom images in a modal (health's medical images, study screenshots). Default false. */
  lightbox?: boolean
  gfm?: boolean
  math?: boolean
  /** Render ```mermaid fences as diagrams (forced off while `streaming`). */
  mermaid?: boolean
  mermaidTheme?: 'neutral' | 'default' | 'dark' | 'forest'
  /** Per-key overrides of the default renderers (mentions, citations, links…). */
  components?: MarkdownComponents
  urlTransform?: UrlTransform
  showCodeLanguage?: boolean
  labels?: Partial<MarkdownCodeBlockLabels & { zoomImage: string; closeImage: string }>
  className?: string
}

const fenceLanguage = (className: string | undefined): string | undefined =>
  /language-([\w+-]+)/.exec(className ?? '')?.[1]

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function splitMatches(value: string, needle: string): { text: string; match: boolean }[] {
  const segments: { text: string; match: boolean }[] = []
  const lower = value.toLowerCase()
  let index = 0
  for (;;) {
    const found = lower.indexOf(needle, index)
    if (found === -1) {
      segments.push({ text: value.slice(index), match: false })
      break
    }
    if (found > index) {
      segments.push({ text: value.slice(index, found), match: false })
    }
    segments.push({ text: value.slice(found, found + needle.length), match: true })
    index = found + needle.length
  }
  return segments.filter((segment) => segment.text !== '')
}

function highlightTree(node: HastNode, needle: string): void {
  const children = node.children
  if (children === undefined) {
    return
  }
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index]!
    if (child.type === 'text' && child.value !== undefined) {
      const segments = splitMatches(child.value, needle)
      if (segments.length > 1 || (segments.length === 1 && segments[0]!.match)) {
        const replaced = segments.map((segment) =>
          segment.match
            ? ({
                type: 'element',
                tagName: 'mark',
                properties: { 'data-as': 'chat-search-match' },
                children: [{ type: 'text', value: segment.text }],
              } satisfies HastNode)
            : { type: 'text', value: segment.text },
        )
        children.splice(index, 1, ...(replaced as HastNode[]))
        index += replaced.length - 1
      }
    } else {
      highlightTree(child, needle)
    }
  }
}

function rehypeHighlightMatches(needle: string) {
  return () => (tree: HastNode) => {
    highlightTree(tree, needle)
  }
}

/**
 * The family's read-only streaming markdown surface: GFM tables, KaTeX math
 * (error-tolerant while streaming), lazily-imported mermaid diagrams, and
 * copyable code blocks with language tags. Raw HTML is never rendered
 * (no `rehype-raw`) — model output is untrusted input (ai-features §7).
 */
export const MarkdownSurface = React.memo(
  React.forwardRef<HTMLDivElement, MarkdownSurfaceProps>(function MarkdownSurface(
    {
      value,
      streaming = false,
      query,
      lightbox = false,
      gfm = true,
      math = true,
      mermaid = true,
      mermaidTheme = 'neutral',
      components,
      urlTransform = defaultUrlTransform,
      showCodeLanguage = true,
      labels,
      className,
    },
    ref,
  ) {
    const mermaidEnabled = mermaid && !streaming
    const highlightQuery =
      query !== undefined && query.trim().length > 0 ? query.trim().toLowerCase() : null
    const [zoom, setZoom] = React.useState<{ src: string; alt: string } | null>(null)

    const defaultComponents = React.useMemo<MarkdownComponents>(
      () => ({
        pre: ({ children }) => {
          const child = Array.isArray(children) ? children[0] : children
          if (React.isValidElement(child)) {
            const childProps = child.props as { className?: string; children?: React.ReactNode }
            const text = extractText(childProps.children).replace(/\n$/, '')
            const language = fenceLanguage(childProps.className)
            if (language === 'mermaid' && mermaidEnabled) {
              return <MermaidDiagram code={text} theme={mermaidTheme} labels={{ diagram: labels?.code }} />
            }
            return (
              <MarkdownCodeBlock code={text} language={language} showLanguage={showCodeLanguage} labels={labels} />
            )
          }
          return <pre>{children}</pre>
        },
        code: ({ className: codeClassName, children, ...rest }) => (
          <code
            className={cn(
              'rounded-[var(--as-radius-sm)] bg-[var(--as-surface-raised)] px-1 py-0.5 font-mono text-[0.85em]',
              codeClassName,
            )}
            {...rest}
          >
            {children}
          </code>
        ),
        a: ({ href, children, ...rest }) => {
          const external =
            typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))
          return (
            <a
              href={href}
              className="text-[var(--as-primary)] underline underline-offset-2"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...rest}
            >
              {children}
            </a>
          )
        },
        table: ({ children, ...rest }) => (
          <div className="my-3 overflow-x-auto rounded-[var(--as-radius)] border border-[var(--as-border)]">
            <table className="w-full border-collapse text-[0.875em]" {...rest}>
              {children}
            </table>
          </div>
        ),
        img: ({ alt, ...rest }) => {
          const image = <img alt={alt ?? ''} className="my-2 max-w-full rounded-[var(--as-radius)]" loading="lazy" {...rest} />
          if (!lightbox || typeof rest.src !== 'string') {
            return image
          }
          const zoomLabel = `${labels?.zoomImage ?? 'Zoom image'}${alt ? `: ${alt}` : ''}`
          return (
            <button
              type="button"
              aria-label={zoomLabel}
              title={zoomLabel}
              onClick={() => setZoom({ src: rest.src as string, alt: alt ?? '' })}
              className="block cursor-zoom-in rounded-[var(--as-radius)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]"
            >
              {image}
            </button>
          )
        },
      }),
      [labels, mermaidEnabled, mermaidTheme, showCodeLanguage, lightbox],
    )

    const mergedComponents = React.useMemo(
      () => ({ ...defaultComponents, ...components }),
      [defaultComponents, components],
    )

    const remarkPlugins = React.useMemo(
      () => [gfm ? remarkGfm : null, math ? remarkMath : null].filter((plugin) => plugin !== null),
      [gfm, math],
    )
    const rehypePlugins = React.useMemo<ReactMarkdownOptions['rehypePlugins']>(() => {
      const plugins: ReactMarkdownOptions['rehypePlugins'] = []
      if (math) {
        plugins.push([rehypeKatex, { strict: false, throwOnError: false, output: 'html' }])
      }
      if (highlightQuery !== null) {
        plugins.push(rehypeHighlightMatches(highlightQuery))
      }
      return plugins
    }, [math, highlightQuery])

    return (
      <div
        ref={ref}
        data-as="chat-markdown"
        data-streaming={streaming || undefined}
        className={cn('min-w-0 text-[var(--as-fg)]', className)}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={mergedComponents}
          urlTransform={urlTransform}
        >
          {value}
        </ReactMarkdown>
        <Modal open={zoom !== null} onOpenChange={(open) => (open ? undefined : setZoom(null))}>
          {zoom !== null ? (
            <ModalContent closeLabel={labels?.closeImage ?? 'Close image'} className="w-fit max-w-[92vw] items-center justify-center p-3">
              <img src={zoom.src} alt={zoom.alt} className="max-h-[78vh] max-w-[86vw] rounded-[var(--as-radius)]" />
            </ModalContent>
          ) : null}
        </Modal>
      </div>
    )
  }),
)

export { MarkdownCodeBlock }
