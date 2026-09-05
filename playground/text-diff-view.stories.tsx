import { TextDiffView } from '../src/components/text-diff-view/TextDiffView'

const ORIGINAL = `The derivative measures the rate of change.
A function is continuous at a point if the limit exists.
The chain rule differentiates composite functions.
Integration is the inverse of differentiation.`

const SUGGESTED = `The derivative measures the instantaneous rate of change.
A function is continuous at a point if the limit exists.
The chain rule differentiates composite functions.
Integration reverses differentiation.`

export const Default = () => {
  return (
    <div style={{ maxWidth: 720 }}>
      <TextDiffView original={ORIGINAL} suggested={SUGGESTED} />
    </div>
  )
}

export const Compact = () => {
  return (
    <div style={{ maxWidth: 560 }}>
      <TextDiffView
        original={ORIGINAL}
        suggested={SUGGESTED}
        contextLines={1}
        bodyClassName="max-h-64"
      />
    </div>
  )
}

export const NoHeader = () => {
  return (
    <div style={{ maxWidth: 480 }}>
      <TextDiffView
        original="the quick fox"
        suggested="the slow fox"
        showHeader={false}
        showNav={false}
      />
    </div>
  )
}
