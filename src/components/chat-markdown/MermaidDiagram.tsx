import * as React from 'react'

import { cn } from '../../lib/utils'
import { MarkdownCodeBlock } from './MarkdownCodeBlock'

export interface MermaidDiagramProps {
  code: string
  theme?: 'neutral' | 'default' | 'dark' | 'forest'
  labels?: { diagram?: string }
  className?: string
}

let mermaidInitialized = false

async function renderMermaid(id: string, code: string, theme: NonNullable<MermaidDiagramProps['theme']>): Promise<string> {
  const mermaid = (await import('mermaid')).default
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme })
    mermaidInitialized = true
  }
  const { svg } = await mermaid.render(id, code)
  return svg
}

export function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}

/**
 * Lazily-rendered mermaid diagram (dynamic `import('mermaid')`, strict
 * security). Falls back to the plain code block when rendering fails —
 * study-assistant's proven behavior.
 */
export const MermaidDiagram = React.forwardRef<HTMLDivElement, MermaidDiagramProps>(
  function MermaidDiagram({ code, theme = 'neutral', labels, className }, ref) {
    const reactId = React.useId().replace(/[^a-zA-Z0-9]/g, '')
    const [svg, setSvg] = React.useState<string | null>(null)
    const [failed, setFailed] = React.useState(false)

    React.useEffect(() => {
      let cancelled = false
      setFailed(false)
      setSvg(null)
      renderMermaid(`as-mermaid-${reactId}`, code, theme)
        .then((result) => {
          if (!cancelled) {
            setSvg(result)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true)
          }
        })
      return () => {
        cancelled = true
      }
    }, [code, theme, reactId])

    if (failed || svg === null) {
      return (
        <MarkdownCodeBlock
          ref={failed ? ref : undefined}
          code={code}
          language="mermaid"
          labels={{ code: labels?.diagram ?? 'Diagram' }}
          className={cn('my-3', svg === null && !failed ? 'opacity-60' : undefined, className)}
        />
      )
    }
    return (
      <div
        ref={ref}
        data-as="mermaid-diagram"
        className={cn(
          'my-3 flex justify-center overflow-x-auto rounded-[var(--as-radius)] border border-[var(--as-border)] bg-[var(--as-surface)] p-3 [&_svg]:max-w-full',
          className,
        )}
        // mermaid runs with securityLevel 'strict' — no user styles, scripts or links survive
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  },
)
