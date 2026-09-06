import * as React from 'react'
import { defaultUrlTransform, type Components, type Options as ReactMarkdownOptions, type UrlTransform } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '../../lib/utils'
import { MarkdownCodeBlock, type MarkdownCodeBlockLabels } from './MarkdownCodeBlock'
import { extractText, MermaidDiagram } from './MermaidDiagram'

export type MarkdownComponents = Components
export type { MarkdownCodeBlockLabels }

export interface MarkdownSurfaceProps {
  /** Markdown source (model output is untrusted — raw HTML never renders). */
  value: string
  /** Live turn: defers mermaid to the final render (streaming floods break diagrams). */
  streaming?: boolean
  gfm?: boolean
  math?: boolean
  /** Render ```mermaid fences as diagrams (forced off while `streaming`). */
  mermaid?: boolean
  mermaidTheme?: 'neutral' | 'default' | 'dark' | 'forest'
  /** Per-key overrides of the default renderers (mentions, citations, links…). */
  components?: MarkdownComponents
  urlTransform?: UrlTransform
  showCodeLanguage?: boolean
  labels?: Partial<MarkdownCodeBlockLabels>
  className?: string
}

const fenceLanguage = (className: string | undefined): string | undefined =>
  /language-([\w+-]+)/.exec(className ?? '')?.[1]

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
        img: ({ alt, ...rest }) => (
          <img alt={alt ?? ''} className="my-2 max-w-full rounded-[var(--as-radius)]" loading="lazy" {...rest} />
        ),
      }),
      [labels, mermaidEnabled, mermaidTheme, showCodeLanguage],
    )

    const mergedComponents = React.useMemo(
      () => ({ ...defaultComponents, ...components }),
      [defaultComponents, components],
    )

    const remarkPlugins = React.useMemo(
      () => [gfm ? remarkGfm : null, math ? remarkMath : null].filter((plugin) => plugin !== null),
      [gfm, math],
    )
    const rehypePlugins = React.useMemo<ReactMarkdownOptions['rehypePlugins']>(
      () =>
        math
          ? [[rehypeKatex, { strict: false, throwOnError: false, output: 'html' }]]
          : [],
      [math],
    )

    return (
      <div ref={ref} data-as="chat-markdown" className={cn('min-w-0 text-[var(--as-fg)]', className)}>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={mergedComponents}
          urlTransform={urlTransform}
        >
          {value}
        </ReactMarkdown>
      </div>
    )
  }),
)

export { MarkdownCodeBlock }
