import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Activity, Building2, CalendarDays, Stethoscope } from 'lucide-react'
import { FacetChip, defaultFilterValue, isDefaultValue } from '../src/components/filters/FacetChip'
import { FilterBar } from '../src/components/filters/FilterBar'
import { FilterRail } from '../src/components/filters/FilterRail'
import { FilterSection } from '../src/components/filters/FilterSection'
import type { FilterFacet, FilterOption, FilterValue } from '../src/components/filters/types'
import '../themes/dark-reference.css'

const facets: FilterFacet[] = [
  {
    id: 'category',
    label: 'Category',
    kind: 'multi',
    icon: <Activity className="size-4" />,
    options: [
      { value: 'labs', label: 'Laboratory', count: 42 },
      { value: 'imaging', label: 'Imaging', count: 12 },
      { value: 'notes', label: 'Notes', count: 7 },
      { value: 'referrals', label: 'Referrals', count: 3 },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    kind: 'single',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
      { value: null, label: 'Not recorded' },
    ],
  },
  { id: 'telemetry', label: 'Telemetry only', kind: 'toggle' },
  {
    id: 'doctor',
    label: 'Doctor',
    kind: 'multi',
    hidden: true,
    icon: <Stethoscope className="size-4" />,
    options: [
      { value: 'chen', label: 'Dr. Chen' },
      { value: 'okafor', label: 'Dr. Okafor' },
      { value: 'silva', label: 'Dr. Silva' },
    ],
  },
  {
    id: 'facility',
    label: 'Facility',
    kind: 'single',
    hidden: true,
    icon: <Building2 className="size-4" />,
    options: [
      { value: 'main', label: 'Main campus' },
      { value: 'east', label: 'East clinic' },
    ],
  },
]

const initial: Record<string, FilterValue> = {
  category: { kind: 'multi', include: ['labs'], exclude: ['referrals'] },
  status: { kind: 'single', value: '' },
  telemetry: { kind: 'toggle', on: false },
  doctor: { kind: 'multi', include: [], exclude: [] },
  facility: { kind: 'single', value: '' },
}

function activeCountOf(values: Record<string, FilterValue | undefined>): number {
  return Object.values(values).filter((value) => value !== undefined && !isDefaultValue(value)).length
}

export const FiltersBar = () => {
  const [values, setValues] = useState(initial)
  const activeCount = activeCountOf(values)
  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <FilterBar
        facets={facets}
        values={values}
        onChange={(id, value) => setValues((current) => ({ ...current, [id]: value }))}
        onClearAll={() =>
          setValues(Object.fromEntries(facets.map((facet) => [facet.id, defaultFilterValue(facet)])))
        }
        activeCount={activeCount}
        summary={`${activeCount === 0 ? 300 : 162} of 300`}
      />
    </div>
  )
}

const honestOptions: FilterOption[] = [
  { value: 'PHASE_3', label: 'Phase 3', count: 89 },
  { value: 'PHASE_2', label: 'Phase 2', count: 200, countAtLeast: true },
  { value: 'PHASE_1', label: 'Phase 1', count: 0 },
  { value: null, label: 'Not recorded', count: 1726, hint: 'no phase in the record' },
  { value: 'PHASE_4', label: 'Phase 4' },
]

const honest: FilterFacet = {
  id: 'phase',
  label: 'Phase',
  kind: 'multi',
  options: honestOptions,
}

export const FiltersHonestCounts = () => {
  const [value, setValue] = useState<FilterValue>({
    kind: 'multi',
    include: ['PHASE_3'],
    exclude: ['PHASE_1'],
  })
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <FacetChip facet={honest} value={value} onValueChange={setValue} />
    </div>
  )
}

export const FiltersSelectedAbsent = () => {
  const [value, setValue] = useState<FilterValue>({
    kind: 'multi',
    include: ['STALE-URL-VALUE'],
    exclude: ['GONE-FROM-OPTIONS'],
  })
  return (
    <div style={{ padding: 24, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--as-muted-fg)' }}>
        <CalendarDays className="size-3" aria-hidden /> facets: null — a stale URL value still has a
        removable pill and no count
      </span>
      <FacetChip
        facet={{ ...honest, options: [] }}
        value={value}
        onValueChange={setValue}
        labels={{ noOptions: 'Counts unavailable' }}
      />
    </div>
  )
}

export const FiltersWithSearch = () => {
  const [values, setValues] = useState<Record<string, FilterValue>>({
    lab: defaultFilterValue({ id: 'lab', label: 'Laboratory marker', kind: 'multi' }),
  })
  const labValue = values.lab
  const labSelected =
    labValue?.kind === 'multi' ? labValue.include.length + labValue.exclude.length : 0
  const lab: FilterFacet = {
    id: 'lab',
    label: 'Laboratory marker',
    kind: 'multi',
    options: [
      'Haemoglobin',
      'Haematocrit',
      'Glucose',
      'HbA1c',
      'Creatinine',
      'eGFR',
      'Sodium',
      'Potassium',
      'Calcium',
      'Ferritin',
    ].map((label) => ({ value: label.toLowerCase(), label })),
  }
  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--as-muted-fg)' }}>
          <CalendarDays className="size-3" aria-hidden /> 10 options → search appears
        </span>
      </div>
      <div style={{ marginTop: 12 }}>
        <FilterBar
          facets={[lab]}
          values={values}
          onChange={(id, value) => setValues((current) => ({ ...current, [id]: value }))}
          onClearAll={() => setValues({ lab: { kind: 'multi', include: [], exclude: [] } })}
          activeCount={labSelected > 0 ? 1 : 0}
        />
      </div>
    </div>
  )
}

const inlineFacet: FilterFacet = {
  id: 'kind',
  label: 'Kind',
  kind: 'multi',
  options: [
    { value: 'labs', label: 'Laboratory' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'notes', label: 'Notes' },
    { value: null, label: 'Not recorded' },
  ],
}

export const InlineChips = () => {
  const [value, setValue] = useState<FilterValue>({
    kind: 'multi',
    include: ['labs'],
    exclude: ['notes'],
  })
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FacetChip facet={inlineFacet} variant="inline" value={value} onValueChange={setValue} />
    </div>
  )
}

const railCategory: FilterFacet = {
  id: 'category',
  label: 'Category',
  kind: 'multi',
  options: [
    { value: 'labs', label: 'Laboratory', count: 42 },
    { value: 'imaging', label: 'Imaging', count: 12 },
    { value: 'notes', label: 'Notes', count: 7 },
    { value: 'referrals', label: 'Referrals', count: 3 },
    { value: null, label: 'Not recorded', count: 9 },
  ],
}

const railPhase: FilterFacet = {
  id: 'phase',
  label: 'Phase',
  kind: 'multi',
  options: [
    { value: 'PHASE_3', label: 'Phase 3', count: 89 },
    { value: 'PHASE_2', label: 'Phase 2', count: 200, countAtLeast: true },
    { value: 'PHASE_1', label: 'Phase 1', count: 0 },
    { value: null, label: 'Not recorded', count: 1726 },
  ],
}

const railTelemetry: FilterFacet = { id: 'telemetry', label: 'Telemetry only', kind: 'toggle' }

const railInitial: Record<string, FilterValue> = {
  category: { kind: 'multi', include: ['labs'], exclude: ['referrals'] },
  phase: { kind: 'multi', include: [], exclude: [] },
  telemetry: { kind: 'toggle', on: false },
}

function sectionActive(value: FilterValue | undefined): boolean {
  return value !== undefined && !isDefaultValue(value)
}

function RailDemo() {
  const [values, setValues] = useState(railInitial)
  const setValue = (id: string) => (value: FilterValue) =>
    setValues((current) => ({ ...current, [id]: value }))
  return (
    <FilterRail
      layout="rail"
      title="Filters"
      activeCount={activeCountOf(values)}
      onClear={() => setValues(railInitial)}
      search={<input type="search" aria-label="Search filters" placeholder="Search filters" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--as-border)', background: 'var(--as-surface)', color: 'var(--as-fg)', fontSize: 13 }} />}
      data-testid="rail-demo"
    >
      <FilterSection
        title="Category"
        active={sectionActive(values.category)}
        count={73}
        defaultOpen
      >
        <FacetChip
          facet={railCategory}
          value={values.category ?? defaultFilterValue(railCategory)}
          onValueChange={setValue('category')}
          variant="inline"
        />
      </FilterSection>
      <FilterSection title="Phase" active={sectionActive(values.phase)} count={200} countAtLeast>
        <FacetChip
          facet={railPhase}
          value={values.phase ?? defaultFilterValue(railPhase)}
          onValueChange={setValue('phase')}
          variant="inline"
        />
      </FilterSection>
      <FilterSection title="Only with telemetry" active={sectionActive(values.telemetry)} count={0}>
        <FacetChip
          facet={railTelemetry}
          value={values.telemetry ?? defaultFilterValue(railTelemetry)}
          onValueChange={setValue('telemetry')}
          variant="inline"
        />
      </FilterSection>
    </FilterRail>
  )
}

function CompactDemo() {
  const [values, setValues] = useState(railInitial)
  const setValue = (id: string) => (value: FilterValue) =>
    setValues((current) => ({ ...current, [id]: value }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 11, color: 'var(--as-muted-fg)', margin: 0 }}>
        Page search lives in the toolbar above the sheet; the sheet is filter-only.
      </p>
      <FilterRail
        layout="compact"
        title="Filters"
        activeCount={activeCountOf(values)}
        onClear={() => setValues(railInitial)}
        search={<input type="search" aria-label="Page search" placeholder="Page search" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--as-border)', background: 'var(--as-surface)', color: 'var(--as-fg)', fontSize: 13 }} />}
        labels={{ filters: 'Filters', clearAll: 'Clear all' }}
        data-testid="compact-demo"
      >
        <FilterSection title="Category" active={sectionActive(values.category)} count={73} defaultOpen>
          <FacetChip
            facet={railCategory}
            value={values.category ?? defaultFilterValue(railCategory)}
            onValueChange={setValue('category')}
            variant="inline"
          />
        </FilterSection>
        <FilterSection title="Phase" active={sectionActive(values.phase)} count={200} countAtLeast>
          <FacetChip
            facet={railPhase}
            value={values.phase ?? defaultFilterValue(railPhase)}
            onValueChange={setValue('phase')}
            variant="inline"
          />
        </FilterSection>
      </FilterRail>
    </div>
  )
}

const frameStyle = {
  background: 'var(--as-surface)',
  color: 'var(--as-fg)',
  border: '1px solid var(--as-border)',
  borderRadius: 12,
  padding: 16,
} as const

function Frame({
  width,
  label,
  dark,
  dir,
  children,
}: {
  width: number
  label: string
  dark?: boolean
  dir?: 'rtl'
  children: ReactNode
}) {
  return (
    <figure style={{ margin: 0, minWidth: 0 }}>
      <figcaption
        style={{ fontSize: 11, marginBottom: 6, color: 'var(--as-muted-fg)' }}
      >
        {label}
      </figcaption>
      <div
        className={dark ? 'dark' : undefined}
        dir={dir}
        data-frame-width={width}
        style={{ ...frameStyle, width, maxWidth: '100%' }}
      >
        {children}
      </div>
    </figure>
  )
}

export const FiltersRailLayout = () => (
  <Frame width={390} label="Rail · 390">
    <RailDemo />
  </Frame>
)

export const FiltersRailWide = Object.assign(
  () => (
    <Frame width={1024} label="Rail · 1024 container (capped by the gallery viewport)">
      <RailDemo />
    </Frame>
  ),
  { parameters: { frame: { width: 1280, height: 900, note: 'intended CI visual frame' } } },
)

export const FiltersRailDark = () => (
  <Frame width={390} label="Rail · 390 · dark" dark>
    <RailDemo />
  </Frame>
)

export const FiltersRailRtl = () => (
  <Frame width={390} label="Rail · 390 · RTL" dir="rtl">
    <RailDemo />
  </Frame>
)

export const FiltersCompactLayout = () => (
  <Frame width={390} label="Compact · 390">
    <CompactDemo />
  </Frame>
)

export const FiltersCompactWide = Object.assign(
  () => (
    <Frame width={1024} label="Compact · 1024 container (capped by the gallery viewport)">
      <CompactDemo />
    </Frame>
  ),
  { parameters: { frame: { width: 1280, height: 900, note: 'intended CI visual frame' } } },
)

export const FiltersCompactDark = () => (
  <Frame width={390} label="Compact · 390 · dark" dark>
    <CompactDemo />
  </Frame>
)

export const FiltersCompactRtl = () => (
  <Frame width={390} label="Compact · 390 · RTL" dir="rtl">
    <CompactDemo />
  </Frame>
)

function AutoOpenSheet({ children }: { children: ReactNode }) {
  const holder = useRef<HTMLDivElement>(null)
  useEffect(() => {
    holder.current?.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')?.click()
  }, [])
  return <div ref={holder}>{children}</div>
}

function CompactSheetOpener() {
  return (
    <AutoOpenSheet>
      <CompactDemo />
    </AutoOpenSheet>
  )
}

export const FiltersCompactOpenSheet = () => (
  <Frame width={390} label="Compact · 390 · sheet open">
    <CompactSheetOpener />
  </Frame>
)

const footerButtonStyle = {
  minHeight: 44,
  padding: '0 16px',
  borderRadius: 'var(--as-radius)',
  border: 'none',
  background: 'var(--as-primary)',
  color: 'var(--as-primary-fg)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
} as const

function FunctionFooterDemo() {
  const [values, setValues] = useState(railInitial)
  const setValue = (id: string) => (value: FilterValue) =>
    setValues((current) => ({ ...current, [id]: value }))
  const shown = activeCountOf(values) === 0 ? 300 : 162
  return (
    <FilterRail
      layout="compact"
      title="Filters"
      activeCount={activeCountOf(values)}
      onClear={() => setValues(railInitial)}
      footer={(close) => (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
        >
          <span style={{ fontSize: 12, color: 'var(--as-muted-fg)' }}>{shown} of 300 results</span>
          <button type="button" onClick={close} style={footerButtonStyle}>
            Show {shown} results
          </button>
        </div>
      )}
    >
      <FilterSection title="Category" active={sectionActive(values.category)} count={73} defaultOpen>
        <FacetChip
          facet={railCategory}
          value={values.category ?? defaultFilterValue(railCategory)}
          onValueChange={setValue('category')}
          variant="inline"
        />
      </FilterSection>
      <FilterSection title="Phase" active={sectionActive(values.phase)} count={200} countAtLeast>
        <FacetChip
          facet={railPhase}
          value={values.phase ?? defaultFilterValue(railPhase)}
          onValueChange={setValue('phase')}
          variant="inline"
        />
      </FilterSection>
    </FilterRail>
  )
}

export const FiltersFunctionFooter = () => (
  <Frame width={390} label="Compact · 390 · function footer">
    <AutoOpenSheet>
      <FunctionFooterDemo />
    </AutoOpenSheet>
  </Frame>
)

const pendingPhase: FilterFacet = { ...railPhase, countsState: 'loading' }

export const FiltersCountsLoading = () => {
  const [value, setValue] = useState<FilterValue>({
    kind: 'multi',
    include: ['PHASE_3'],
    exclude: [],
  })
  return (
    <div
      style={{ padding: 24, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <span style={{ fontSize: 12, color: 'var(--as-muted-fg)' }}>
        <CalendarDays className="size-3" aria-hidden /> countsState="loading" — every option count is
        withheld (and the chip is aria-busy) until the facet query answers; a stale number would lie
      </span>
      <FilterSection title="Phase" active defaultOpen>
        <FacetChip facet={pendingPhase} value={value} onValueChange={setValue} variant="inline" />
      </FilterSection>
    </div>
  )
}

export const FiltersReducedMotion = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 390, maxWidth: '100%' }}>
    <style>{`
      @media (prefers-reduced-motion: reduce) {
        .filters-reduced-motion-demo * {
          transition-duration: 0s !important;
          animation-duration: 0s !important;
        }
      }
    `}</style>
    <p style={{ fontSize: 12, color: 'var(--as-muted-fg)', margin: 0 }}>
      Section chevrons carry <code>motion-reduce:transition-none</code>. The guard is asserted by the
      class test in <code>tests/filters.test.tsx</code>, not by this screenshot — a screenshot
      cannot prove a media query, and the story frame forces every transition off for the capture.
    </p>
    <div className="filters-reduced-motion-demo">
      <Frame width={390} label="Rail · 390 · reduced motion">
        <RailDemo />
      </Frame>
    </div>
  </div>
)
