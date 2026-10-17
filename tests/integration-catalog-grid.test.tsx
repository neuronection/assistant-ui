import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { IntegrationCatalogGrid } from '../src/components/integration-catalog-grid/IntegrationCatalogGrid'
import { extension } from './integration-fixtures'

const ENTRIES = [
  extension({ id: 'a-fetcher', name: 'Alpha fetcher', categories: ['search'] }),
  extension({ id: 'b-files', name: 'Beta files', categories: ['files'] }),
  extension({ id: 'c-other', name: 'Gamma tool', categories: [] }),
]

function setup(overrides = {}, props = {}) {
  const handlers = { onInstall: vi.fn(), onQueryChange: vi.fn() }
  return {
    handlers,
    ...render(
      <IntegrationCatalogGrid
        entries={ENTRIES}
        query=""
        {...handlers}
        {...overrides}
        {...props}
      />,
    ),
  }
}

describe('IntegrationCatalogGrid', () => {
  it('groups entries by the charter category vocabulary with an other bucket', () => {
    setup()
    expect(screen.getByTestId('integration-catalog-category-search')).toBeTruthy()
    expect(screen.getByTestId('integration-catalog-category-files')).toBeTruthy()
    expect(screen.getByTestId('integration-catalog-category-other')).toBeTruthy()
    expect(screen.getByTestId('integration-catalog-entry-a-fetcher')).toBeTruthy()
  })

  it('filters entries from the controlled query (name, summary, id)', () => {
    setup({ query: 'alpha' })
    expect(screen.getByTestId('integration-catalog-entry-a-fetcher')).toBeTruthy()
    expect(screen.queryByTestId('integration-catalog-entry-b-files')).toBeNull()
  })

  it('reports the typed query through onQueryChange (keyboard)', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    function Harness() {
      const [query, setQuery] = React.useState('')
      return (
        <IntegrationCatalogGrid
          entries={ENTRIES}
          query={query}
          onQueryChange={(next) => {
            onQueryChange(next)
            setQuery(next)
          }}
        />
      )
    }
    render(<Harness />)
    await user.click(screen.getByLabelText('Search'))
    await user.keyboard('alpha')
    expect(onQueryChange).toHaveBeenCalledWith('a')
    expect(onQueryChange).toHaveBeenCalledWith('alpha')
    expect(screen.getByTestId('integration-catalog-entry-a-fetcher')).toBeTruthy()
    expect(screen.queryByTestId('integration-catalog-entry-b-files')).toBeNull()
  })

  it('installs compatible entries; incompatible reasons render verbatim with no install', async () => {
    const user = userEvent.setup()
    const { handlers } = setup({
      entries: [
        extension({ id: 'ok-one' }),
        extension({ id: 'bad-one', hostCompat: { compatible: false, reason: "kind 'mini-app' is not hosted" } }),
      ],
    })
    await user.click(screen.getByRole('button', { name: 'Install' }))
    expect(handlers.onInstall).toHaveBeenCalledWith(expect.objectContaining({ id: 'ok-one' }))
    expect(screen.getByTestId('integration-catalog-reason-bad-one').textContent).toContain(
      "kind 'mini-app' is not hosted",
    )
  })

  it('shows the configured count and listed chip for source entries', () => {
    setup({ entries: [extension({ id: 'listed-one', originClass: 'listed', installedInstanceCount: 2 })] })
    expect(screen.getByText('listed')).toBeTruthy()
    expect(screen.getByText('2 configured')).toBeTruthy()
  })

  it('ships the loading/error/empty triad', () => {
    const loading = render(<IntegrationCatalogGrid entries={[]} query="" onQueryChange={() => {}} loading />)
    expect(loading.container.querySelector('[data-state="loading"]')).toBeTruthy()
    loading.unmount()
    const error = render(
      <IntegrationCatalogGrid entries={[]} query="" onQueryChange={() => {}} error="registry unreachable" />,
    )
    expect(screen.getByRole('alert').textContent).toBe('registry unreachable')
    error.unmount()
    render(<IntegrationCatalogGrid entries={[]} query="" onQueryChange={() => {}} />)
    expect(screen.getByTestId('integration-catalog-empty').textContent).toBe(
      'No integrations available.',
    )
  })

  it('has no axe violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
