import { useState } from 'react'
import { InstanceModeControl, type InstanceAuthMode } from '../src/components/instance-mode-control'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const Open = () => (
  <div style={{ maxWidth: 480 }}>
    <InstanceModeControl
      mode="open"
      onSetAuthenticated={async (password) => {
        await wait(600)
        console.log('enable login with', password.length, 'chars')
      }}
      onSetOpen={() => undefined}
    />
  </div>
)

export const Authenticated = () => (
  <div style={{ maxWidth: 480 }}>
    <InstanceModeControl
      mode="authenticated"
      onSetAuthenticated={() => undefined}
      onSetOpen={async (password) => {
        await wait(600)
        console.log('disable login with', password.length, 'chars')
      }}
    />
  </div>
)

export const AuthenticatedBlocked = () => (
  <div style={{ maxWidth: 480 }}>
    <InstanceModeControl
      mode="authenticated"
      otherUserCount={2}
      onSetAuthenticated={() => undefined}
      onSetOpen={() => undefined}
    />
  </div>
)

export const ServerIdentity = () => (
  <div style={{ maxWidth: 480 }}>
    <InstanceModeControl
      mode="authenticated"
      serverIdentity
      onSetAuthenticated={() => undefined}
      onSetOpen={() => undefined}
    />
  </div>
)

export const WithError = () => {
  const [mode, setMode] = useState<InstanceAuthMode>('open')
  return (
    <div style={{ maxWidth: 480 }}>
      <InstanceModeControl
        mode={mode}
        error="Instance settings failed to load"
        onSetAuthenticated={async () => {
          await wait(400)
          setMode('authenticated')
        }}
        onSetOpen={async () => {
          await wait(400)
          setMode('open')
        }}
      />
    </div>
  )
}
