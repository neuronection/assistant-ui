import { action } from '@ladle/react'

import {
  SurfaceRenderer,
  type SurfaceFilter,
  type SurfaceView,
} from '../src/components/surface-renderer/SurfaceRenderer'

const REPORT: SurfaceView = {
  nodes: [
    { id: 'status', type: 'badge', bind: 'run.status' },
    { id: 'scanned', type: 'stat', bind: 'totals.scanned' },
    { id: 'kept', type: 'stat', bind: 'totals.keep' },
    { id: 'decided', type: 'progress', bind: 'decided' },
    { id: 'filters', type: 'filter-bar', filters: ['verdict'] },
    { id: 'density', type: 'select', bind: 'density', options: ['low', 'medium', 'high'] },
    { id: 'actions', type: 'actions', actions: ['run:export', 'run:diff'] },
    { id: 'items', type: 'table', columns: ['path', 'verdict', 'confidence'] },
    { id: 'c', type: 'cards', of: 'groups' },
    { id: 'evidence', type: 'evidence' },
  ],
  values: {
    run: { status: 'ok' },
    totals: { scanned: 148, keep: 61 },
    decided: { done: 94, total: 148 },
  },
  rows: [
    {
      id: 'f1',
      values: { path: 'src/api/orders.ts', verdict: 'keep', confidence: '0.93' },
      badge: 'keep',
      badgeField: 'verdict',
      group: 'keep',
      evidence: { rule: 'fresh', answers: { age: '2d', score: 0.93 } },
      evidenceSummary: 'rule.fresh · age, score',
      actions: ['item:open'],
    },
    {
      id: 'f2',
      values: { path: 'src/ui/modals.tsx', verdict: 'ask', confidence: '0.41' },
      badge: 'ask',
      badgeField: 'verdict',
      group: 'ask',
      evidence: { rule: 'unusual-perms', answers: { perms: '0o777' } },
      evidenceSummary: 'rule.unusual-perms · perms',
      actions: ['item:override', 'item:exclude'],
    },
    {
      id: 'f3',
      values: { path: 'dist/bundle.js', verdict: 'candidate', confidence: '0.88' },
      badge: 'candidate',
      badgeField: 'verdict',
      group: 'candidate',
      evidence: { rule: 'build-cache' },
      evidenceSummary: 'rule.build-cache',
    },
  ],
  groups: {},
}

const LABELS: Record<string, string> = {
  'report.status': 'Status',
  'report.scanned': 'Files scanned',
  'report.kept': 'Kept',
  'report.decided': 'Decided',
  'report.filters': 'Verdicts',
  'report.density': 'Density',
  'report.items.path': 'Path',
  'report.items.verdict': 'Verdict',
  'report.items.confidence': 'Confidence',
  'action.run:export': 'Export report',
  'action.run:diff': 'Diff against last run',
  'action.item:open': 'Open',
  'action.item:override': 'Override',
  'action.item:exclude': 'Exclude',
  'status.keep': 'Keep',
  'status.ask': 'Needs a look',
  'status.candidate': 'Candidate',
  'status.ok': 'Completed',
}

const FILTERS: SurfaceFilter[] = [
  {
    id: 'verdict',
    options: [
      { value: 'keep', label: 'Keep' },
      { value: 'ask', label: 'Needs a look' },
      { value: 'candidate', label: 'Candidate' },
    ],
  },
]

export default {
  title: 'Surface renderer',
}

export const Default = () => (
  <div className="max-w-3xl p-4">
    <SurfaceRenderer
      surface={REPORT}
      labels={LABELS}
      filters={FILTERS}
      activeFilters={{ verdict: 'all' }}
      onAction={(a) => action('onAction')(`${a.id}${a.rowId ? ` on ${a.rowId}` : ''}`)}
      onFilterChange={(facet, value) => action('onFilterChange')(`${facet} → ${value ?? 'all'}`)}
    />
  </div>
)

export const ReferenceCVGallery = () => (
  <div className="max-w-3xl p-4">
    <SurfaceRenderer
      surface={{
        nodes: [
          { id: 'heading', type: 'stat', bind: 'totals.layouts' },
          { id: 'filters', type: 'filter-bar', filters: ['language'] },
          { id: 'density', type: 'select', bind: 'density', options: ['low', 'high'] },
          { id: 'gallery', type: 'cards', of: 'items' },
          { id: 'evidence', type: 'evidence' },
          { id: 'actions', type: 'actions', actions: ['run:export'] },
        ],
        values: { totals: { layouts: 4 } },
        rows: [
          {
            id: 'cv-compact',
            values: {},
            title: 'Compact',
            badge: 'recommended',
            meta: ['Print', 'single column', 'CJK friendly'],
            evidence: { layout: 'compact', fit: '92% of sampled listings' },
            evidenceSummary: '92% of sampled listings',
            actions: ['item:open'],
          },
          {
            id: 'cv-modernist',
            values: {},
            title: 'Modernist',
            meta: ['sans headings', 'two-column body'],
            actions: ['item:open'],
          },
        ],
      }}
      labels={LABELS}
      filters={[
        {
          id: 'language',
          options: [
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
          ],
        },
      ]}
      activeFilters={{ language: 'all', density: 'all' }}
      onAction={(a) => action('onAction')(`${a.id}${a.rowId ? ` on ${a.rowId}` : ''}`)}
      onFilterChange={(facet, value) => action('onFilterChange')(`${facet} → ${value ?? 'all'}`)}
    />
  </div>
)
