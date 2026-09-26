import * as React from 'react'

import { cn } from '../../lib/utils'

/**
 * The three states of the boot machine (identity-auth §4): `checking`
 * while the app's boot flow runs, `authenticated` once a session was
 * established, `anonymous` when the app must land on its login surface.
 */
export type AuthGateStatus = 'checking' | 'authenticated' | 'anonymous'

export interface AuthGateLabels {
  /** Splash text rendered while the boot flow runs. */
  checking: string
}

export interface AuthGateProps {
  /**
   * Boot flow (identity-auth §4/§11): resolves `true` when a session was
   * established, `false` when the app must land on the login surface. A
   * rejected promise counts as `false` — a failed boot never wedges the
   * gate on `checking`. The gate runs it once on mount and again whenever
   * `resetKey` changes; endpoint wiring stays app-owned (ADR-006: no
   * fetching of its own).
   */
  boot: () => Promise<boolean>
  /** The authenticated app. Rendered only after `boot` resolved `true`. */
  children: React.ReactNode
  /**
   * Login surface (identity-auth §5.10/§12) — app-composed from the shared
   * `LoginForm`/`RegisterForm` inside the app's own branding shell.
   * Rendered while anonymous. Signal a successful sign-in by changing
   * `resetKey` so the gate re-runs the boot flow.
   */
  login: React.ReactNode
  /**
   * Splash node for the checking state. Defaults to a token-styled
   * `role="status"` splash centring `labels.checking`; apps with their own
   * boot splash (e.g. dark-mode-aware backgrounds) pass the node instead.
   */
  checking?: React.ReactNode
  /** Strings for the checking state; apps translate at the call site. */
  labels?: Partial<AuthGateLabels>
  /**
   * Changing this value re-runs the machine from `checking` — the recovery
   * path for mid-session 401s (the app's unauthenticated event) and for
   * post-login or forced-drop transitions the app decides. Bump it from
   * the app; the gate never listens to the network itself. A `string` may
   * bundle several signals (`${status}:${epoch}`) when the app wants the
   * machine to follow an external session verdict.
   */
  resetKey?: string | number
  /** Event out: fires after every machine transition (incl. the first). */
  onStatusChange?: (status: AuthGateStatus) => void
  className?: string
}

const defaultLabels: AuthGateLabels = {
  checking: 'Checking session…',
}

/**
 * Session gate around the app (identity-auth §4): owns the
 * `checking → authenticated | anonymous` machine and the rendering for
 * each state, while the app owns everything endpoint-shaped through
 * `boot`/`resetKey`. Desktop `open` instances never render the login
 * surface — their zero-UI exchange simply resolves `true` before the
 * machine leaves `checking` (§11). Demo auto-login is untouched (§13):
 * badge the demo from outside the gate so it rides along in every state.
 */
export const AuthGate = React.forwardRef<HTMLDivElement, AuthGateProps>(
  function AuthGate(
    {
      boot,
      children,
      login,
      checking,
      labels,
      resetKey,
      onStatusChange,
      className,
    },
    ref,
  ) {
    const merged = { ...defaultLabels, ...labels }
    const [status, setStatus] = React.useState<AuthGateStatus>('checking')

    // Latest-ref mirrors: the machine re-runs only on mount and on a
    // `resetKey` change — never because the app passed an inline `boot`.
    const bootRef = React.useRef(boot)
    const notifyRef = React.useRef(onStatusChange)
    React.useEffect(() => {
      bootRef.current = boot
      notifyRef.current = onStatusChange
    })

    React.useEffect(() => {
      const signal = { cancelled: false }
      setStatus('checking')
      void bootRef
        .current()
        .catch(() => false)
        .then((established) => {
          if (!signal.cancelled) {
            setStatus(established ? 'authenticated' : 'anonymous')
          }
        })
      return () => {
        signal.cancelled = true
      }
    }, [resetKey])

    React.useEffect(() => {
      notifyRef.current?.(status)
    }, [status])

    return (
      <div ref={ref} data-as="auth-gate" className={cn(className)}>
        {status === 'authenticated' ? (
          children
        ) : status === 'anonymous' ? (
          login
        ) : (
          (checking ?? (
            <div
              role="status"
              className="flex min-h-screen items-center justify-center bg-[var(--as-surface)] px-4 text-sm text-[var(--as-muted-fg)]"
            >
              {merged.checking}
            </div>
          ))
        )}
      </div>
    )
  },
)
