import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { AddIntegrationSourceDialog } from '../src/components/add-integration-source-dialog/AddIntegrationSourceDialog'
import { ConsentDialog } from '../src/components/consent-dialog/ConsentDialog'
import { consent, T3_DISCLOSURE } from './integration-fixtures'

afterEach(cleanup)

describe('AddIntegrationSourceDialog', () => {
  it('submits the typed descriptor draft with trimmed values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onOpenChange = vi.fn()
    render(<AddIntegrationSourceDialog open onOpenChange={onOpenChange} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('https git URL'), 'https://git.example.com/ext/repo  ')
    await user.selectOptions(screen.getByLabelText('Ref strategy'), 'tag-pattern')
    await user.type(screen.getByLabelText('Tag pattern / branch / commit sha'), 'v*')
    await user.click(screen.getByRole('button', { name: 'Add source' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://git.example.com/ext/repo',
        refStrategy: 'tag-pattern',
        refValue: 'v*',
        secretValue: undefined,
      }),
    )
    expect(onSubmit.mock.calls[0]?.[0]?.localPath).toBe('')
  })

  it('blocks submit until the descriptor is usable (https or local path, ref value)', () => {
    render(<AddIntegrationSourceDialog open onOpenChange={() => {}} onSubmit={vi.fn()} />)
    expect((screen.getByRole('button', { name: 'Add source' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })

  it('renders the sealed credential slot only when the host declares one', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AddIntegrationSourceDialog
        open
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        secretSlot="repo-token"
      />,
    )
    const secret = screen.getByLabelText('Private-source token (sealed slot)')
    await user.type(secret, 'tok')
    await user.type(screen.getByLabelText('https git URL'), 'https://git.example.com/x')
    await user.click(screen.getByRole('button', { name: 'Add source' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ secretSlot: 'repo-token', secretValue: 'tok' }),
    )
  })

  it('shows the fetch/validate progress state and the error state', () => {
    render(<AddIntegrationSourceDialog open onOpenChange={() => {}} onSubmit={vi.fn()} busy />)
    expect(screen.getByRole('status').textContent).toContain('Fetching and validating')
    cleanup()
    render(
      <AddIntegrationSourceDialog open onOpenChange={() => {}} onSubmit={vi.fn()} error="sync failed: unreachable" />,
    )
    expect(screen.getByRole('alert').textContent).toBe('sync failed: unreachable')
  })

  it('keyboard: escape closes through onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<AddIntegrationSourceDialog open onOpenChange={onOpenChange} onSubmit={vi.fn()} />)
    await user.tab()
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations (open dialog)', async () => {
    render(<AddIntegrationSourceDialog open onOpenChange={() => {}} onSubmit={vi.fn()} />)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('ConsentDialog', () => {
  it('renders the payload verbatim — provenance, digest, capabilities and the law disclosure', () => {
    render(<ConsentDialog open onOpenChange={() => {}} payload={consent()} onConsent={vi.fn()} />)
    const body = screen.getByTestId('integration-consent')
    expect(body.textContent).toContain('Neuronection')
    expect(body.textContent).toContain('MIT')
    expect(body.textContent).toContain('https://example.com/your-fork/career-connector-template')
    expect(screen.getByTestId('integration-consent-digest').textContent).toBe(
      '3af53a1ef0ece88bdce9469f83db5f584d17fc18b56634578688a9a8794ec75e',
    )
    expect(screen.getByTestId('integration-consent-disclosure').textContent).toBe(T3_DISCLOSURE)
    expect(screen.getByTestId('integration-consent-tier').textContent).toBe('T3 · imported')
    expect(screen.getByTestId('integration-consent').textContent).toContain('state-changing')
  })

  it('titles per variant: install, re-consent and update', () => {
    const view = render(
      <ConsentDialog open onOpenChange={() => {}} payload={consent()} onConsent={vi.fn()} />,
    )
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('Consent to import')
    view.unmount()
    render(
      <ConsentDialog
        open
        onOpenChange={() => {}}
        payload={consent({ variant: 're-consent' })}
        onConsent={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('re-consent required')
  })

  it('renders the change summary above the verbatim law text (capability growth)', () => {
    render(
      <ConsentDialog
        open
        onOpenChange={() => {}}
        payload={consent({
          variant: 're-consent',
          changeSummary: {
            addedCapabilities: ['secrets', 'net'],
            removedCapabilities: ['notify'],
            versionChange: { from: '1.0.0', to: '1.1.0' },
            digestChange: { from: 'a'.repeat(64), to: 'b'.repeat(64) },
          },
        })}
        onConsent={vi.fn()}
      />,
    )
    const changes = screen.getByTestId('integration-consent-changes')
    expect(changes.textContent).toContain('secrets, net')
    expect(changes.textContent).toContain('notify')
    expect(changes.textContent).toContain('1.0.0 → 1.1.0')
    const dialog = screen.getByTestId('integration-consent')
    expect(
      dialog.textContent?.indexOf('secrets, net') < dialog.textContent?.indexOf(T3_DISCLOSURE),
    ).toBe(true)
  })

  it('renders the host context copy above the verbatim law text when provided', () => {
    const view = render(
      <ConsentDialog
        open
        onOpenChange={() => {}}
        payload={consent()}
        context="Imported from github.com/example/fork — this consent covers code not authored by the app."
        onConsent={vi.fn()}
      />,
    )
    const context = screen.getByTestId('integration-consent-context')
    expect(context.textContent).toBe(
      'Imported from github.com/example/fork — this consent covers code not authored by the app.',
    )
    const dialog = screen.getByTestId('integration-consent')
    expect(
      dialog.textContent?.indexOf('github.com/example/fork') <
        dialog.textContent?.indexOf(T3_DISCLOSURE),
    ).toBe(true)
    view.unmount()
    render(
      <ConsentDialog open onOpenChange={() => {}} payload={consent()} onConsent={vi.fn()} />,
    )
    expect(screen.queryByTestId('integration-consent-context')).toBeNull()
  })

  it('fires onConsent only from the explicit confirm; decline emits and closes', async () => {
    const user = userEvent.setup()
    const onConsent = vi.fn()
    const onDecline = vi.fn()
    const onOpenChange = vi.fn()
    const payload = consent()
    const view = render(
      <ConsentDialog
        open
        onOpenChange={onOpenChange}
        payload={payload}
        onConsent={onConsent}
        onDecline={onDecline}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'I consent' }))
    expect(onConsent).toHaveBeenCalledWith(payload)
    view.unmount()
    render(
      <ConsentDialog
        open
        onOpenChange={onOpenChange}
        payload={payload}
        onConsent={onConsent}
        onDecline={onDecline}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Decline' }))
    expect(onDecline).toHaveBeenCalledWith(payload)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keyboard: the dialog receives focus (confirm or decline) and escape closes it', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConsentDialog open onOpenChange={onOpenChange} payload={consent()} onConsent={vi.fn()} />)
    const focused = document.activeElement?.textContent
    expect(focused === 'I consent' || focused === 'Decline').toBe(true)
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations (open dialog)', async () => {
    render(<ConsentDialog open onOpenChange={() => {}} payload={consent()} onConsent={vi.fn()} />)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
