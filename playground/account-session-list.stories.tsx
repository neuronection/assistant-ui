import { action } from '@ladle/react'
import { Laptop, Smartphone } from 'lucide-react'

import {
  AccountSessionList,
  type AccountSessionRow,
} from '../src/components/account-session-list/AccountSessionList'

const labels = {
  current: 'This device',
  revoke: 'Revoke',
  revoking: 'Revoking…',
}

const currentRow: AccountSessionRow = {
  id: 'session-1',
  current: true,
  label: 'Chrome on Linux',
  details: ['Created 2026-11-01 09:12', 'Last seen 2026-11-13 00:04', '203.0.113.7'],
  icon: <Laptop className="size-4" aria-hidden />,
  badges: (
    <span className="rounded-full bg-[var(--as-muted)] px-2 py-0.5 text-[10px] text-[var(--as-muted-fg)]">
      2FA
    </span>
  ),
}

const rows: AccountSessionRow[] = [
  currentRow,
  {
    id: 'session-2',
    label: 'Pixel 9',
    details: ['Created 2026-11-10 18:45', 'Last seen 2026-11-12 21:30', '198.51.100.24'],
    icon: <Smartphone className="size-4" aria-hidden />,
  },
  {
    id: 'session-3',
    label: 'Safari on macOS',
    details: ['Created 2026-10-28 07:20', 'Last seen 2026-11-11 08:02'],
  },
]

export const Populated = () => (
  <div className="max-w-2xl">
    <AccountSessionList
      rows={rows}
      labels={labels}
      onRevoke={(id) => action('onRevoke')(id)}
      headerAction={
        <button
          type="button"
          className="rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-1 text-xs"
          onClick={() => action('signOutOthers')()}
        >
          Sign out other sessions
        </button>
      }
    />
  </div>
)

export const Busy = () => (
  <div className="max-w-2xl">
    <AccountSessionList
      rows={rows}
      labels={labels}
      busyId="session-2"
      onRevoke={(id) => action('onRevoke')(id)}
    />
  </div>
)

export const Empty = () => (
  <div className="max-w-2xl">
    <AccountSessionList rows={[]} labels={labels} onRevoke={(id) => action('onRevoke')(id)} />
  </div>
)

const revokedRow: AccountSessionRow = {
  id: 'session-4',
  label: 'Firefox on Windows',
  details: ['Created 2026-10-30 11:05', 'Signed out 2026-11-02 19:41'],
  revoked: true,
}

const managedRow: AccountSessionRow = {
  id: 'session-5',
  label: 'Pixel 9 (managed device)',
  details: ['Created 2026-09-14 08:00', 'Last seen 2026-11-13 00:00', 'Policy: sign out disabled'],
  icon: <Smartphone className="size-4" aria-hidden />,
  revocable: false,
}

export const Revoked = () => (
  <div className="max-w-2xl">
    <AccountSessionList
      rows={[currentRow, revokedRow, managedRow]}
      labels={{ ...labels, revoked: 'Signed out' }}
      onRevoke={(id) => action('onRevoke')(id)}
    />
  </div>
)

export const Unrevocable = () => (
  <div className="max-w-2xl">
    <AccountSessionList
      rows={[revokedRow, managedRow]}
      labels={labels}
      onRevoke={(id) => action('onRevoke')(id)}
    />
  </div>
)
