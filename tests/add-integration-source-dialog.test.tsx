import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { AddIntegrationSourceDialog } from '../src/components/add-integration-source-dialog'

function renderDialog(props: Partial<React.ComponentProps<typeof AddIntegrationSourceDialog>> = {}) {
  const onSubmit = vi.fn()
  const onOpenChange = vi.fn()
  const result = render(
    <AddIntegrationSourceDialog open onOpenChange={onOpenChange} onSubmit={onSubmit} {...props} />,
  )
  return { ...result, onSubmit, onOpenChange }
}

afterEach(() => cleanup())

describe('AddIntegrationSourceDialog', () => {
  it('legacy mode shows both fields (back-compat)', () => {
    renderDialog()
    expect(screen.getByLabelText('https git URL')).toBeDefined()
    expect(screen.getByLabelText('Local repo path (dev/test only)')).toBeDefined()
  })

  it('chooser mode asks the kind first and reveals one field set', async () => {
    const user = userEvent.setup()
    renderDialog({ kind: 'chooser' })
    expect(screen.queryByTestId('integration-source-form')).toBeNull()
    await user.click(screen.getByTestId('integration-source-kind-git'))
    expect(screen.getByLabelText('https git URL')).toBeDefined()
    expect(screen.queryByLabelText('Local repo path (dev/test only)')).toBeNull()
  })

  it('choosing local prefills branch/main and shows only the path field', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog({ kind: 'chooser' })
    await user.click(screen.getByTestId('integration-source-kind-local'))
    expect(screen.getByLabelText('Local repo path (dev/test only)')).toBeDefined()
    expect(screen.queryByLabelText('https git URL')).toBeNull()
    expect(screen.getByLabelText('Ref strategy')).toHaveValue('branch')
    expect(screen.getByLabelText('Tag pattern / branch / commit sha')).toHaveValue('main')
    await user.type(screen.getByLabelText('Local repo path (dev/test only)'), '/srv/bundle')
    await user.click(screen.getByText('Add source'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ localPath: '/srv/bundle', refStrategy: 'branch', refValue: 'main' }),
    )
  })

  it('pinned local kind skips the chooser and keeps initial values', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog({
      kind: 'local',
      initial: { localPath: '/srv/bundle', refStrategy: 'commit-pin', refValue: 'a'.repeat(40) },
    })
    expect(screen.queryByTestId('integration-source-kind-chooser')).toBeNull()
    expect(screen.getByLabelText('Local repo path (dev/test only)')).toHaveValue('/srv/bundle')
    await user.click(screen.getByText('Add source'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ refStrategy: 'commit-pin', refValue: 'a'.repeat(40) }),
    )
  })

  it('value-requiring strategies keep submit disabled until a value is set', async () => {
    const user = userEvent.setup()
    renderDialog({ kind: 'git', initial: { url: 'https://example.invalid/x', refStrategy: 'branch' } })
    const submit = screen.getByText('Add source')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Tag pattern / branch / commit sha'), 'main')
    expect(submit).toBeEnabled()
  })

  it('has no axe violations in chooser mode', async () => {
    const { container } = renderDialog({ kind: 'chooser' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
