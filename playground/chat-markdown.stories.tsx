import { MarkdownSurface } from '../src/components/chat-markdown/MarkdownSurface'

const sample = `# Study plan

Given $f(x) = x^2$, the derivative follows from the limit:

$$
\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} = 2x
$$

## Steps

1. Read the **limits** chapter
2. Practice ~20 exercises
3. Plot convergence:

\`\`\`mermaid
graph TD
  Read[Read chapter] --> Practice[Practice]
  Practice --> Plot[Plot convergence]
  Plot --> Done[Mastered]
\`\`\`

Track progress in the table:

| Week | Topic | Exercises |
| --- | --- | --- |
| 1 | Limits | 20 |
| 2 | Derivatives | 25 |

> Tip: the epsilon-delta definition clicks after plotting.

\`\`\`python
def slope(f, x, h=1e-6):
    return (f(x + h) - f(x)) / h
\`\`\`

Inline \`code\` renders as a chip and [links](https://example.com) open safely.
`

export const Default = () => (
  <div style={{ maxWidth: 520 }}>
    <MarkdownSurface value={sample} />
  </div>
)

export const Streaming = () => (
  <div style={{ maxWidth: 520 }}>
    <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
      streaming: mermaid deferred, text renders live
    </p>
    <MarkdownSurface value={sample} streaming />
  </div>
)

export const MathOnly = () => (
  <div style={{ maxWidth: 520 }}>
    <MarkdownSurface value={'Euler: $e^{i\\pi} + 1 = 0$ and display:\n\n$$\n\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n$$'} />
  </div>
)
