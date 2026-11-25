import { useState } from 'react'
import { Activity, Building2, CalendarDays, Stethoscope } from 'lucide-react'
import { FacetChip } from '../src/components/filters/FacetChip'
import { FilterBar } from '../src/components/filters/FilterBar'
import { FilterPills } from '../src/components/filters/FilterPills'
import type { FilterFacet, FilterValue } from '../src/components/filters/types'

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
  category: { kind: 'multi', values: ['labs'] },
  status: { kind: 'single', value: '' },
  telemetry: { kind: 'toggle', on: false },
  doctor: { kind: 'multi', values: [] },
  facility: { kind: 'single', value: '' },
}

function isActive(value: FilterValue | undefined): boolean {
  if (!value) return false
  if (value.kind === 'toggle') return value.on
  if (value.kind === 'single') return value.value !== ''
  return value.values.length > 0
}

export const FiltersBar = () => {
  const [values, setValues] = useState(initial)
  const activeCount = Object.values(values).filter(isActive).length
  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <FilterBar
        facets={facets}
        values={values}
        onChange={(id, value) => setValues((current) => ({ ...current, [id]: value }))}
        onClearAll={() => setValues(initial)}
        activeCount={activeCount}
        summary={`${activeCount === 0 ? 300 : 162} of 300`}
      />
    </div>
  )
}

export const FiltersWithSearch = () => {
  const [values, setValues] = useState<Record<string, FilterValue>>({
    lab: { kind: 'multi', values: [] },
  })
  const labSelected = values.lab?.kind === 'multi' ? values.lab.values.length : 0
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
          onClearAll={() => setValues({ lab: { kind: 'multi', values: [] } })}
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
  ],
}

export const InlineChips = () => {
  const [values, setValues] = useState<string[]>(['labs'])
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FacetChip
        facet={inlineFacet}
        variant="inline"
        value={{ kind: 'multi', values }}
        onValueChange={(value) => setValues(value.kind === 'multi' ? value.values : [])}
      />
      <FilterPills
        items={values.map((value) => ({ key: value, label: value }))}
        onRemove={(key) => setValues((current) => current.filter((entry) => entry !== key))}
      />
    </div>
  )
}
