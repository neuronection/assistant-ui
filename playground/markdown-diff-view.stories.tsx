import { MarkdownDiffView } from '../src/components/markdown-diff-view/MarkdownDiffView'

const ORIGINAL = `## Integration by substitution

Let $u = g(x)$ so that $du = g'(x)\\,dx$.

The integral becomes

$$
\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du
$$

Always convert the limits when the integral is definite.`

const SUGGESTED = `## Integration by substitution

Let $u = g(x)$ so that $du = g'(x)\\,dx$.

The integral becomes

$$
\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du
$$

### Worked example

For $\\int 2x\\,e^{x^2}\\,dx$ pick $u = x^2$, hence $du = 2x\\,dx$.

Always convert the limits when the integral is definite.`

export const Default = () => {
  return (
    <div style={{ maxWidth: 860 }}>
      <MarkdownDiffView original={ORIGINAL} suggested={SUGGESTED} bodyClassName="max-h-96" />
    </div>
  )
}

export const Compact = () => {
  return (
    <div style={{ maxWidth: 560 }}>
      <MarkdownDiffView
        original={ORIGINAL}
        suggested={SUGGESTED}
        contextBlocks={0}
        bodyClassName="max-h-64"
      />
    </div>
  )
}

export const NoHeader = () => {
  return (
    <div style={{ maxWidth: 480 }}>
      <MarkdownDiffView
        original="The derivative measures the rate of change."
        suggested="The derivative measures the instantaneous rate of change."
        showHeader={false}
        showNav={false}
      />
    </div>
  )
}
