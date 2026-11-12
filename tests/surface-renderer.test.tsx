import * as React from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import {
  SURFACE_NODE_TYPES,
  SURFACE_RUN_ACTION_IDS,
  SURFACE_ITEM_ACTION_IDS,
  SURFACE_PAGE_SIZE,
  surfaceProgressPercent,
  SurfaceRenderer,
  surfaceActionId,
  type SurfaceAction,
  type SurfaceActionId,
  type SurfaceRow,
  type SurfaceView,
} from '../src/components/surface-renderer/SurfaceRenderer'

const HERE = join(process.cwd(), 'tests')

function loadFixtures(): Record<string, unknown> {
  return JSON.parse(readFileSync(join(HERE, 'surface-renderer.fixtures.json'), 'utf8'))
}

type Expectation = Record<string, unknown>

const asText = (value: unknown): string => (value === undefined || value === null ? '' : String(value))

/** Renders one fixture case, returning the container + the recorded
 * action/filter funnels. The SAME walker shape the hosts reuse. */
function renderCase(surface: Record<string, unknown>, props: Record<string, unknown> = {}) {
  const actions: SurfaceAction[] = []
  const filterEvents: Array<{ facet: string; value: string | null }> = []
  const view = {
    nodes: surface.nodes as SurfaceView['nodes'],
    rows: (surface.rows ?? undefined) as SurfaceRow[] | undefined,
    values: (surface.values ?? undefined) as SurfaceView['values'],
    groups: (surface.groups ?? undefined) as SurfaceView['groups'],
  }
  const utils = render(
    <SurfaceRenderer
      surface={view}
      labels={(surface.labels ?? undefined) as Record<string, string> | undefined}
      filters={(props.filters ?? undefined) as never}
      activeFilters={(props.activeFilters ?? undefined) as Record<string, string> | undefined}
      truncatedLabel={
        ((surface.truncatedLabel ?? props.truncatedLabel) ?? undefined) as string | undefined
      }
      onAction={(action) => actions.push(action)}
      onFilterChange={(facet, value) => filterEvents.push({ facet, value })}
    />,
  )
  return { utils, actions, filterEvents }
}

describe('surface renderer — closed vocabulary', () => {
  it('exposes the charter component + action vocabularies (closed, seeded from ADR-0029)', () => {
    const fixtures = loadFixtures()
    const vocab = fixtures.vocabulary as { components: string[]; actions: { run: string[]; item: string[] } }
    expect(SURFACE_NODE_TYPES).toEqual(vocab.components)
    expect(SURFACE_RUN_ACTION_IDS).toEqual(vocab.actions.run)
    expect(SURFACE_ITEM_ACTION_IDS).toEqual(vocab.actions.item)
  })

  it('keeps the vendored fixtures byte-identical to the family canonical when ../dev is present', () => {
    const dev = join(HERE, '../../../dev/contracts/surface-renderer.fixtures.json')
    let canonical: string
    try {
      canonical = readFileSync(dev, 'utf8')
    } catch {
      return
    }
    expect(canonical).toBe(readFileSync(join(HERE, 'surface-renderer.fixtures.json'), 'utf8'))
  })

  it('filters unknown node types and unknown action ids at the seam', () => {
    expect(surfaceActionId('run:export')).toBe(true)
    expect(surfaceActionId('item:open')).toBe(true)
    expect(surfaceActionId('run:explode')).toBe(false)
    expect(surfaceActionId('nonsense')).toBe(false)
  })

  it('resolves progress binds: {done,total} shapes and raw percents', () => {
    expect(surfaceProgressPercent({ done: 3, total: 4 })).toBe(75)
    expect(surfaceProgressPercent(66.4)).toBe(66)
    expect(surfaceProgressPercent(120)).toBe(100)
    expect(surfaceProgressPercent(undefined)).toBe(null)
    expect(surfaceProgressPercent({ done: 2, total: 0 })).toBe(0)
  })
})

describe('surface renderer — component behavior', () => {
  it('renders every component kind with stable walk keys', () => {
    const surface: SurfaceView = {
      nodes: [
        { id: 'gate', type: 'stat', bind: 'totals.scanned' },
        { id: 'summary', type: 'badge', bind: 'totals.mood' },
        { id: 'moved', type: 'progress', bind: 'moved' },
        { id: 'pick', type: 'select', bind: 'density', options: ['low', 'high'] },
      ],
      values: { totals: { scanned: 12, mood: 'busy' }, moved: { done: 1, total: 3 } },
    }
    render(
      <SurfaceRenderer
        surface={surface}
        labels={{
          'report.gate': 'Gate',
          'report.summary': 'Summary',
          'report.moved': 'Moved',
          'report.pick': 'Density',
        }}
      />,
    )
    expect(screen.getByTestId('surface')).toBeInTheDocument()
    expect(screen.getByTestId('surface-gate')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('busy')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Moved' })).toHaveAttribute('aria-valuenow', '33')
    const select = screen.getByTestId('surface-select-density')
    expect(within(select.parentElement as HTMLElement).getByText('Density')).toBeInTheDocument()
    expect((select as HTMLSelectElement).value).toBe('')
  })

  it('row actions emit typed ids only for closed vocabulary ids', async () => {
    const user = userEvent.setup()
    const surface: SurfaceView = {
      nodes: [{ id: 'items', type: 'table', columns: ['title'] }],
      rows: [{ id: 'r1', values: { title: 'a' }, actions: ['item:open', 'nonsense' as SurfaceActionId] }],
    }
    const actions: SurfaceAction[] = []
    render(<SurfaceRenderer surface={surface} onAction={(a) => actions.push(a)} />)
    await user.click(screen.getByTestId('surface-action-item:open-r1'))
    expect(actions).toEqual([{ id: 'item:open', rowId: 'r1' }])
    expect(screen.queryByTestId('surface-action-item:warp-r1')).not.toBeInTheDocument()
  })

  it('toolbar actions emit rowId-less events', async () => {
    const user = userEvent.setup()
    const surface: SurfaceView = {
      nodes: [{ id: 'actions', type: 'actions', actions: ['run:export'] }],
    }
    const actions: SurfaceAction[] = []
    render(
      <SurfaceRenderer
        surface={surface}
        labels={{ 'action.run:export': 'Export' }}
        onAction={(a) => actions.push(a)}
      />,
    )
    await user.click(screen.getByTestId('surface-action-run:export'))
    expect(actions).toEqual([{ id: 'run:export', rowId: undefined }])
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('filter chips and selects are controlled facets', async () => {
    const user = userEvent.setup()
    const surface: SurfaceView = {
      nodes: [
        { id: 'filters', type: 'filter-bar', filters: ['verdict'] },
        { id: 'density', type: 'select', bind: 'density', options: ['low', 'high'] },
      ],
    }
    const filterEvents: Array<[string, string | null]> = []
    render(
      <SurfaceRenderer
        surface={surface}
        filters={[
          { id: 'verdict', options: [{ value: 'keep', label: 'Keep' }, { value: 'ask' }] },
          { id: 'density', options: [{ value: 'low', label: 'Compact' }, { value: 'high' }] },
        ]}
        activeFilters={{ verdict: 'ask' }}
        onFilterChange={(id, value) => filterEvents.push([id, value])}
      />,
    )
    const allChip = screen.getByTestId('surface-filter-verdict-all')
    expect(allChip).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('surface-filter-verdict-ask')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('surface-filter-verdict-ask').textContent).toBe('ask')
    expect(screen.getByTestId('surface-filter-verdict-keep').textContent).toBe('Keep')
    await user.click(screen.getByTestId('surface-filter-verdict-all'))
    expect(filterEvents).toEqual([['verdict', null]])
    await user.selectOptions(screen.getByTestId('surface-select-density'), 'high')
    expect(filterEvents).toEqual([
      ['verdict', null],
      ['density', 'high'],
    ])
  })

  it('tables render badge cells via badgeField and title-attr overflow', () => {
    const surface: SurfaceView = {
      nodes: [{ id: 't', type: 'table', columns: ['title', 'verdict'] }],
      rows: [{ id: 'r1', values: { title: 'a-file', verdict: 'keep' }, badge: 'keep', badgeField: 'verdict' }],
    }
    render(<SurfaceRenderer surface={surface} labels={{ 'report.t.title': 'Path' }} />)
    expect(screen.getByText('Path')).toBeInTheDocument()
    expect(screen.getByTestId('surface-cell-r1-title')).toHaveTextContent('a-file')
    expect(screen.getByTestId('surface-badge-r1-verdict')).toHaveTextContent('keep')
  })

  it('carries evidence disclosures with host-resolved summaries', () => {
    const surface: SurfaceView = {
      nodes: [
        { id: 't', type: 'table', columns: ['title'] },
        { id: 'evidence', type: 'evidence' },
      ],
      rows: [
        {
          id: 'r1',
          values: { title: 'a' },
          evidence: { rule: 'fresh' },
          evidenceSummary: 'rule.fresh',
        },
      ],
    }
    render(<SurfaceRenderer surface={surface} />)
    expect(screen.getByText('Evidence — rule.fresh')).toBeInTheDocument()
    expect(screen.getByTestId('surface-evidence-r1')).toBeInTheDocument()
  })

  it('grouped cards resolve section headings with counts in first-seen order', () => {
    const surface: SurfaceView = {
      nodes: [{ id: 'c', type: 'cards', of: 'groups' }],
      rows: [
        { id: 'a', values: {}, title: 'alpha', group: 'keep' },
        { id: 'b', values: {}, title: 'beta', group: 'ask' },
        { id: 'c-1', values: {}, title: 'gamma', group: 'keep' },
      ],
      groups: { keep: 'Keep' },
    }
    render(
      <SurfaceRenderer surface={surface} labels={{ 'status.ask': 'Needs a look' }} />,
    )
    const keep = screen.getByRole('region', { name: 'Keep' })
    const ask = screen.getByRole('region', { name: 'Needs a look' })
    expect(within(keep).getAllByTestId(/^surface-row-/)).toHaveLength(2)
    expect(within(ask).getAllByTestId(/^surface-row-/)).toHaveLength(1)
  })

  it('paginates past 50 rows with a load-more control', async () => {
    const user = userEvent.setup()
    const rows: SurfaceRow[] = Array.from({ length: 61 }, (_, index) => ({
      id: `r${index}`,
      values: { title: `row-${index}` },
    }))
    const surface: SurfaceView = {
      nodes: [{ id: 't', type: 'table', columns: ['title'] }],
      rows,
    }
    render(<SurfaceRenderer surface={surface} loadMoreLabel="More" />)
    expect(screen.getAllByTestId(/^surface-row-/)).toHaveLength(SURFACE_PAGE_SIZE)
    await user.click(screen.getByTestId('surface-load-more'))
    expect(screen.getAllByTestId(/^surface-row-/)).toHaveLength(61)
  })

  it('truncation notices ride the host as resolved text under role=status', () => {
    const surface: SurfaceView = {
      nodes: [{ id: 't', type: 'stat', bind: 'totals.scanned' }],
      values: { totals: { scanned: 1 } },
    }
    render(<SurfaceRenderer surface={surface} truncatedLabel="6 more omitted" />)
    expect(screen.getByRole('status')).toHaveTextContent('6 more omitted')
  })

  it('mounts no markup outside the closed vocabulary (D17)', () => {
    const surface: SurfaceView = {
      nodes: [
        { id: 't', type: 'table', columns: ['title'] },
        { id: 'c', type: 'cards', of: 'items' },
        { id: 'evidence', type: 'evidence' },
      ],
      rows: [
        {
          id: 'r1',
          values: { title: '<script>alert(1)</script>' },
          title: '<iframe src=x></iframe>',
          evidence: { payload: '<img src=x onerror=alert(1)>' },
          evidenceSummary: '<style>h1{}</style>',
        },
      ],
    }
    const { container } = render(<SurfaceRenderer surface={surface} />)
    for (const tag of ['script', 'iframe', 'style', 'img']) {
      expect(container.querySelector(tag)).toBeNull()
    }
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
    for (const el of container.querySelectorAll('*')) {
      for (const attr of Array.from(el.attributes ?? [])) {
        if (attr.name.startsWith('on')) {
          throw new Error(`inline handler leaked: ${attr.name}`)
        }
      }
    }
  })

  it('renders the evidence payload as parsed data, never a raw JSON dump', () => {
    const surface: SurfaceView = {
      nodes: [
        { id: 't', type: 'table', columns: ['title'] },
        { id: 'evidence', type: 'evidence' },
      ],
      rows: [{ id: 'r1', values: { title: 'a' }, evidence: { rule: 'fresh', score: 0.9 } }],
    }
    const { container } = render(<SurfaceRenderer surface={surface} />)
    const disclosure = screen.getByTestId('surface-evidence-r1')
    disclosure!.querySelector?.('summary')?.click?.()
    expect(within(disclosure as HTMLElement).getByText('rule')).toBeInTheDocument()
    expect(within(disclosure as HTMLElement).queryByTestId?.('surface-raw-json') ?? null).toBeNull()
    void container
  })

  it('is keyboard reachable and axe-clean (facet chips, selects, actions, evidence)', async () => {
    const user = userEvent.setup()
    const surface: SurfaceView = {
      nodes: [
        { id: 's', type: 'stat', bind: 'totals.scanned' },
        { id: 'b', type: 'badge', bind: 'status' },
        { id: 'p', type: 'progress', bind: 'moved' },
        { id: 'filters', type: 'filter-bar', filters: ['verdict'] },
        { id: 'density', type: 'select', bind: 'density', options: ['low'] },
        { id: 'actions', type: 'actions', actions: ['run:export'] },
        { id: 't', type: 'table', columns: ['title'] },
        { id: 'c', type: 'cards', of: 'groups' },
        { id: 'evidence', type: 'evidence' },
      ],
      values: { totals: { scanned: 3 }, status: 'live', moved: { done: 1, total: 3 } },
      rows: [
        { id: 'r1', values: { title: 'a' }, actions: ['item:open'], group: 'keep', evidence: { rule: 'x' }, evidenceSummary: 'x' },
      ],
      groups: { keep: 'Keep' },
    }
    const { container } = render(
      <SurfaceRenderer
        surface={surface}
        labels={{ 'action.run:export': 'Export', 'report.b': 'Signal', 'report.p': 'Moved' }}
        filters={[{ id: 'verdict', options: [{ value: 'keep', label: 'Keep' }] }]}
      />,
    )
    await user.tab()
    expect(document.activeElement).not.toBe(document.body)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('surface renderer — family fixture parity (dev/contracts fixture wall)', () => {
  const fixtures = loadFixtures()

  function assertExpectation(expectEntry: Expectation, utils: ReturnType<typeof render>) {
    const kind = expectEntry.kind as string
    const queryTestId = (testId: string) => utils.container.querySelector(`[data-testid="${CSS.escape(testId)}"]`)
    switch (kind) {
      case 'note':
        return
      case 'no-html':
        break
      case 'component': {
        const id = expectEntry.id as string
        const el = queryTestId(`surface-${id}`)
        expect(el, `missing component ${id}`).not.toBeNull()
        if (expectEntry.label !== undefined) {
          const labelText = asText(expectEntry.label)
          const labelMatched = Array.from(el!.querySelectorAll('*')).some(
            (child) => child.textContent === labelText && child !== el,
          )
          if (!labelMatched) throw new Error(`component ${id}: label ${labelText} not rendered`)
        }
        if (expectEntry.value !== undefined) {
          const value = asText(expectEntry.value)
          const textMatched = Array.from(el!.querySelectorAll('*')).some(
            (child) => child.textContent === value,
          )
          if (!textMatched) throw new Error(`component ${id}: value ${value} not rendered`)
        }
        if (expectEntry.columns !== undefined) {
          const columns = (expectEntry.columns as string[]).map((column) => asText(column))
          const headers = Array.from(el!.querySelectorAll('th')).map((th) => th.textContent)
          expect(headers).toEqual(columns)
        }
        if (expectEntry.rows !== undefined) {
          for (const row of expectEntry.rows as Expectation[]) {
            const rowEl = queryTestId(`surface-row-${row.rowId}`)
            expect(rowEl, `row ${row.rowId} missing`).not.toBeNull()
            const cells = (row.cells ?? []) as string[]
            const cellEls = Array.from((el as HTMLElement).querySelectorAll(`[data-testid^="surface-cell-${row.rowId}-"]`))
            expect(cellEls.map((cell) => cell.querySelector('.block')?.textContent ?? cell.textContent)).toEqual(cells.map(asText))
            if (row.evidenceSummary !== undefined) {
              const evidence = queryTestId(`surface-evidence-${row.rowId}`)
              expect(evidence?.querySelector('summary')?.textContent).toBe(asText(row.evidenceSummary))
            }
          }
        }
        if (expectEntry.optionText !== undefined) {
          const expected = Array.isArray(expectEntry.optionText)
            ? (expectEntry.optionText as unknown[]).map((option) => asText(option))
            : [asText(expectEntry.optionText)]
          const options = Array.from(el!.querySelector('select')!.options).map((option) => option.textContent)
          expect(options).toEqual(expected)
        }
        break
      }
      case 'bar': {
        const id = expectEntry.id as string
        const bar = queryTestId(`surface-${id}`)!.querySelector('[role="progressbar"]')
        expect(bar, `bar ${id} missing`).not.toBeNull()
        if (expectEntry.label !== undefined) {
          expect(bar!.getAttribute('aria-label')).toBe(asText(expectEntry.label))
        }
        expect(bar!.getAttribute('aria-valuenow')).toBe(String(expectEntry.percent))
        break
      }
      case 'row': {
        const rowId = asText(expectEntry.rowId)
        const row = queryTestId(`surface-row-${rowId}`)
        expect(row, `row ${rowId} missing`).not.toBeNull()
        if (expectEntry.title !== undefined) {
          expect(row!.querySelector('.truncate')?.textContent).toBe(asText(expectEntry.title))
        }
        if (expectEntry.badge !== undefined) {
          const badges = Array.from((row as HTMLElement).querySelectorAll('[data-as="badge"]'))
          expect(badges.some((badge) => badge.textContent === asText(expectEntry.badge))).toBe(true)
        }
        if (expectEntry.meta !== undefined) {
          const meta = expectEntry.meta as string[]
          expect(
            meta.every((segment) => Array.from((row as HTMLElement).querySelectorAll('[data-as="surface-card"] *')).some((el) => el.textContent === segment)),
          ).toBe(true)
        }
        if (expectEntry.evidenceSummary !== undefined) {
          const summaryEl = (row as HTMLElement).querySelector('summary')
          expect(summaryEl?.textContent).toBe(asText(expectEntry.evidenceSummary))
        }
        if (expectEntry.actionLabel !== undefined) {
          const buttons = Array.from((row as HTMLElement).querySelectorAll('button'))
          expect(buttons.some((button) => button.textContent === asText(expectEntry.actionLabel))).toBe(true)
        }
        if (expectEntry.section !== undefined) {
          const section = expectEntry.section as { heading: string; count: number }
          const region = (row as HTMLElement).closest('section')
          expect(region!.getAttribute('aria-label')).toBe(asText(section.heading))
          const rowsInRegion = region!.querySelectorAll('[data-testid^="surface-row-"]')
          expect(rowsInRegion.length).toBe(section.count)
        }
        break
      }
      case 'text': {
        const text = asText(expectEntry.text)
        const el = utils.getByText(text)
        if (expectEntry.role !== undefined) {
          expect(el.getAttribute('role')).toBe(asText(expectEntry.role))
        }
        if (expectEntry.aria !== undefined) {
          for (const [name, value] of Object.entries(expectEntry.aria as Record<string, unknown>)) {
            expect(el.getAttribute(name)).toBe(asText(value))
          }
        }
        break
      }
      case 'click': {
        const target = queryTestId(asText(expectEntry.click))
        expect(target, `click target missing: ${expectEntry.click}`).not.toBeNull()
        if (expectEntry.text !== undefined) {
          expect(target!.textContent).toBe(asText(expectEntry.text))
        }
        break
      }
      case 'change':
        break
      case 'absent': {
        expect(queryTestId(asText(expectEntry.testid)), `${expectEntry.testid} must never render`).toBeNull()
        break
      }
      default:
        throw new Error(`unknown expectation kind ${kind}`)
    }
  }

  it.each(
    (fixtures.cases as Array<Record<string, unknown>>).map((fixtureCase) => fixtureCase.id as string),
  )('fixture case: %s', async (caseId) => {
    const user = userEvent.setup()
    const fixtureCase = (fixtures.cases as Array<Record<string, unknown>>).find(
      (candidate) => candidate.id === caseId,
    )!
    const surfaceCase = fixtureCase.surface as Record<string, unknown>
    const merged = {
      ...surfaceCase,
      labels: {
        ...((surfaceCase.labels ?? {}) as Record<string, string>),
        ...((fixtureCase.labels ?? {}) as Record<string, string>),
      },
    }
    const { utils, actions, filterEvents } = renderCase(merged, fixtureCase as Record<string, unknown>)
    for (const entry of fixtureCase.expect as Expectation[]) {
      assertExpectation(entry, utils)
    }

    const events = (fixtureCase.expect as Expectation[]).filter((entry) => entry.kind === 'click')
    for (const entry of events) {
      const testId = asText(entry.click)
      const target = utils.container.querySelector(`[data-testid="${CSS.escape(testId)}"]`) as HTMLElement | null
      expect(target, `click target missing: ${testId}`).not.toBeNull()
      const before = { actions: [...actions], filterEvents: [...filterEvents] }
      await user.click(target!)
      if (entry.event !== undefined) {
        if (typeof (entry.event as Record<string, unknown>).facet === 'string') {
          const event = entry.event as { facet: string; value: string | null }
          expect(filterEvents.slice(before.filterEvents.length)).toEqual([{ facet: event.facet, value: event.value }])
        } else {
          const event = entry.event as { id: string; rowId?: string | null }
          expect(actions.slice(before.actions.length)).toEqual([
            { id: event.id, rowId: (event.rowId ?? undefined) as string | undefined },
          ])
        }
      }
    }

    const changes = (fixtureCase.expect as Expectation[]).filter((entry) => entry.kind === 'change')
    for (const entry of changes) {
      const testId = asText(entry.select)
      const selectEl = utils.container.querySelector(`[data-testid="${CSS.escape(testId)}"]`) as HTMLSelectElement
      expect(selectEl).not.toBeNull()
      const value = asText(entry.value)
      expect(Array.from(selectEl.options).some((option) => option.value === value)).toBe(true)
      await user.selectOptions(selectEl, value)
      const event = entry.event as { facet: string; value: string | null }
      const last = filterEvents[filterEvents.length - 1]
      expect(last).toEqual({ facet: event.facet, value: event.value })
    }

    if ((fixtureCase.expect as Expectation[]).some((entry) => entry.kind === 'no-html')) {
      expect(utils.container.querySelector('script, iframe, style, img, object, embed')).toBeNull()
      expect(utils.container.querySelector('a[href^="javascript:"]')).toBeNull()
    }

    expect(await axe(utils.container)).toHaveNoViolations()
  })
})
