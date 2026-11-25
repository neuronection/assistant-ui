import { useState } from 'react'
import { Activity, Building2, CalendarDays, Stethoscope } from 'lucide-react'
import { FacetChip, defaultFilterValue, isDefaultValue } from '../src/components/filters/FacetChip'
import { FilterBar } from '../src/components/filters/FilterBar'
import type { FilterFacet, FilterOption, FilterValue } from '../src/components/filters/types'

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
  return Object.values(values).reduce((total, value) => {
    if (!value || isDefaultValue(value)) return total
    if (value.kind === 'multi') return total + value.include.length + value.exclude.length
    return total + 1
  }, 0)
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
