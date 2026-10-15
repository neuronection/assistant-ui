import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  ExtensionSourcesPanel,
  type ExtensionInstallView,
  type ExtensionSourceView,
} from '../src/components/extension-sources/ExtensionSourcesPanel'

const T3_DISCLOSURE =
  "This extension runs as a separate process outside the app's network perimeter. It opens its own network connections, with no SSRF guard, robots.txt check or rate limiting by the app. The app governs only what it returns: outputs are validated and capped."

const DIGEST = '3af53a1ef0ece88bdce9469f83db5f584d17fc18b56634578688a9a8794ec75e'

const consent = {
  extensionId: 'example-posting-fetcher',
  version: '1.0.0',
  tier: 'T3',
  importClass: 'imported',
  capabilities: ['sync'],
  provenance: {
    author: 'Neuronection',
    license: 'MIT',
    repository: 'https://example.com/your-fork/career-connector-template',
    description: 'Reference posting fetcher',
  },
  digest: DIGEST,
  disclosureKey: 't3PerimeterDisclosure',
  disclosure: T3_DISCLOSURE,
}

const SOURCE: ExtensionSourceView = {
  id: 'src-1',
  kind: 'local',
  origin: '/home/dev/src/career-connector-template',
  status: 'ok',
  candidates: [
    {
      extensionId: 'example-posting-fetcher',
      digest: DIGEST,
      compatible: true,
      consent,
    },
    {
      extensionId: 'broken-fetcher',
      digest: '9'.repeat(64),
      compatible: false,
      reason: "kind 'mini-app' is not hosted",
    },
  ],
  installs: [],
}

const INSTALLED: ExtensionSourceView = {
  id: 'src-1',
  kind: 'git',
  origin: 'https://git.example.com/ext/repo',
  status: 'ok',
  candidates: [],
  installs: [
    {
      id: 'inst-1',
      extensionId: 'example-posting-fetcher',
      version: '1.0.0',
      digest: DIGEST,
      tier: 'T3',
      originClass: 'imported',
      enabled: false,
      update: null,
    },
  ],
}

function setup(source: ExtensionSourceView = SOURCE) {
  const handlers = {
    onAddSource: vi.fn(),
    onCheck: vi.fn(),
    onRemoveSource: vi.fn(),
    onConsentInstall: vi.fn(),
    onEnable: vi.fn(),
    onApplyUpdate: vi.fn(),
    onPark: vi.fn(),
    onTombstone: vi.fn(),
  }
  const view = render(<ExtensionSourcesPanel sources={[source]} {...handlers} />)
  return { handlers, ...view }
}

describe('ExtensionSourcesPanel', () => {
  it('renders the ordered source row with kind + status chips', () => {
    setup()
    expect(screen.getByTestId('ext-source-src-1')).toBeTruthy()
    expect(screen.getByText('/home/dev/src/career-connector-template')).toBeTruthy()
    expect(screen.getByTestId('ext-source-status-src-1').textContent).toBe('ok')
  })

  it('renders the consent payload verbatim — provenance, digest, disclosure', () => {
    setup()
    const body = screen.getByTestId('ext-consent')
    expect(body.textContent).toContain('Neuronection')
    expect(body.textContent).toContain('MIT')
    expect(body.textContent).toContain('https://example.com/your-fork/career-connector-template')
    expect(screen.getByTestId('ext-consent-digest').textContent).toBe(DIGEST)
    expect(screen.getByTestId('ext-consent-disclosure').textContent).toBe(T3_DISCLOSURE)
  })

  it('marks incompatible candidates with their reason and offers no install', () => {
    setup()
    const candidate = screen.getByTestId('ext-candidate-broken-fetcher')
    expect(candidate.textContent).toContain("kind 'mini-app' is not hosted")
    expect(
      screen.queryByTestId('ext-candidate-broken-fetcher')?.querySelector('button'),
    ).toBeNull()
  })

  it('installs only through the explicit consent confirmation (keyboard path)', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    const confirm = screen.getAllByRole('button', { name: 'I consent — install' })[0]
    expect(confirm).toBeDefined()
    await user.click(confirm as HTMLButtonElement)
    expect(handlers.onConsentInstall).not.toHaveBeenCalled()
    const dialog = screen.getByTestId('ext-consent-confirm')
    expect(dialog.getAttribute('role')).toBe('alertdialog')
    const dialogConfirm = dialog.querySelector('button')
    expect(dialogConfirm).not.toBeNull()
    await user.click(dialogConfirm as HTMLButtonElement)
    expect(handlers.onConsentInstall).toHaveBeenCalledWith('src-1', {
      extensionId: 'example-posting-fetcher',
      digest: DIGEST,
      compatible: true,
      consent,
    })
  })

  it('renders installs with origin-class chips and never as official', () => {
    setup(INSTALLED)
    expect(screen.getByTestId('ext-origin-example-posting-fetcher').textContent).toBe(
      'imported',
    )
  })

  it('emits enable, park and tombstone from install rows', async () => {
    const user = userEvent.setup()
    const { handlers } = setup(INSTALLED)
    const row = screen.getByTestId('ext-install-example-posting-fetcher')
    const toggle = row.querySelector('input[type="checkbox"]')
    expect(toggle).not.toBeNull()
    await user.click(toggle as HTMLInputElement)
    expect(handlers.onEnable).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Park' }))
    expect(handlers.onPark).toHaveBeenCalled()
    await user.click(
      screen.getByRole('button', { name: 'Tombstone: example-posting-fetcher' }),
    )
    expect(handlers.onTombstone).toHaveBeenCalled()
  })

  it('surfaces update-available (with re-consent) and digest drift states', () => {
    const base: ExtensionInstallView = {
      id: 'inst-1',
      extensionId: 'example-posting-fetcher',
      version: '1.0.0',
      digest: DIGEST,
      tier: 'T3',
      originClass: 'imported',
      enabled: false,
      update: null,
    }
    const withUpdate: ExtensionSourceView = {
      ...INSTALLED,
      installs: [
        { ...base, update: { state: 'available', digest: '1'.repeat(64), requiresReconsent: true } },
        {
          ...base,
          id: 'inst-2',
          extensionId: 'drifted-fetcher',
          update: { state: 'digest-drift' },
        },
      ],
    }
    const { handlers } = setup(withUpdate)
    expect(
      screen.getByTestId('ext-update-example-posting-fetcher').textContent,
    ).toContain('re-consent required')
    expect(screen.getByTestId('ext-drift-drifted-fetcher').textContent).toContain(
      'digest drift',
    )
    screen.getByRole('button', { name: 'Apply update' }).click()
    expect(handlers.onApplyUpdate).toHaveBeenCalled()
  })

  it('emits the add-from-git draft from the form', async () => {
    const user = userEvent.setup()
    const { handlers } = setup()
    await user.click(screen.getByRole('button', { name: 'Add source' }))
    await user.type(screen.getByLabelText('https git URL'), 'https://git.example.com/ext/repo')
    await user.selectOptions(screen.getByLabelText('Ref strategy'), 'tag-pattern')
    await user.type(screen.getByLabelText('Tag pattern / branch / commit'), 'v*')
    await user.click(screen.getByRole('button', { name: 'Add source' }))
    expect(handlers.onAddSource).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://git.example.com/ext/repo',
        refStrategy: 'tag-pattern',
        refValue: 'v*',
      }),
    )
  })

  it('has no axe violations', async () => {
    const { container } = setup(INSTALLED)
    expect(await axe(container)).toHaveNoViolations()
  })
})
