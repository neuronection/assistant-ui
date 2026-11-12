import { useEffect, useRef } from 'react'
import { action } from '@ladle/react'

import { SecretOnceBlock } from '../src/components/secret-once-block/SecretOnceBlock'

const secret = 'nx_mcp_live_7f3c9a1e4b8d_9e2b6c0f5a7d'

export const Default = () => (
  <div className="max-w-xl">
    <SecretOnceBlock
      secret={secret}
      warning="Copy this secret now — it is shown once and cannot be recovered."
      onCopied={() => action('onCopied')()}
    />
  </div>
)

export const CustomLabels = () => (
  <div className="max-w-xl">
    <SecretOnceBlock
      secret={secret}
      warning="This token grants access to your account. Store it in a password manager."
      copyLabel="Copy token"
      copiedLabel="Token copied"
      testId="story-secret-once"
      onCopied={() => action('onCopied')()}
    />
  </div>
)

export const Copied = () => {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let restore: (() => void) | null = null
    try {
      const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard')
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
      })
      restore = () => {
        if (descriptor) {
          Object.defineProperty(Navigator.prototype, 'clipboard', descriptor)
        } else {
          Reflect.deleteProperty(navigator, 'clipboard')
        }
      }
    } catch {
      restore = null
    }
    const tick = () => {
      root.current?.querySelector<HTMLButtonElement>('button')?.click()
    }
    tick()
    const id = setInterval(tick, 800)
    return () => {
      clearInterval(id)
      restore?.()
    }
  }, [])

  return (
    <div ref={root} className="max-w-xl">
      <SecretOnceBlock
        secret={secret}
        warning="Copy this secret now — it is shown once and cannot be recovered."
      />
    </div>
  )
}
