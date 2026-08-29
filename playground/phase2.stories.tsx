import { useState } from 'react'
import { ChipInput } from '../src/components/chip-input/ChipInput'
import { ChipList, type ChipVariant } from '../src/components/chip-list/ChipList'
import { RangeBar } from '../src/components/range-bar/RangeBar'
import { ScaleSlider } from '../src/components/scale-slider/ScaleSlider'
import { Table } from '../src/components/table/Table'
import { DatePicker } from '../src/components/date-picker/DatePicker'
import { CopyButton } from '../src/components/copy-button/CopyButton'
import { Breadcrumbs } from '../src/components/breadcrumbs/Breadcrumbs'

export const ChipEditing = () => {
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript'])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <ChipInput
        value={skills}
        onChange={setSkills}
        placeholder="Add a skill and press Enter…"
      />
      <ChipList items={skills} onRemove={(item) => setSkills(skills.filter((s) => s !== item))} />
    </div>
  )
}

export const ChipVariants = () => {
  const variants: ChipVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
      {variants.map((variant) => (
        <ChipList
          key={variant}
          variant={variant}
          items={[`${variant} chip`, `${variant} chip 2`]}
          onItemClick={() => {}}
          showChevron
        />
      ))}
      <ChipList items={[]} emptyText="No chips selected yet." />
    </div>
  )
}

export const RangeBars = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
    <RangeBar low={40000} high={62000} unit="€" label="median" value={51000} />
    <RangeBar low={40} high={60} min={0} max={100} label="explicit domain" />
  </div>
)

export const ScaleSliders = () => {
  const [weight, setWeight] = useState<number | ''>(3)
  const [mood, setMood] = useState<number | ''>('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 380 }}>
      <ScaleSlider
        min={1}
        max={5}
        value={weight}
        onChange={setWeight}
        lowLabel="meh"
        highLabel="love it"
      />
      <ScaleSlider
        min={1}
        max={10}
        value={mood}
        onChange={setMood}
        lowLabel="low"
        highLabel="high"
        showInput={false}
      />
    </div>
  )
}

export const DataTable = () => (
  <div style={{ maxWidth: 480 }}>
    <Table
      headers={['Role', 'Fit', 'Demand']}
      rows={[
        ['Frontend engineer', '92%', 'hot'],
        ['Full-stack engineer', '84%', 'growing'],
      ]}
    />
  </div>
)

export const EmptyTable = () => (
  <div style={{ maxWidth: 480 }}>
    <Table headers={['Role', 'Fit']} rows={[]} emptyText="No roles scored yet." />
  </div>
)

export const DatePickers = () => {
  const [deadline, setDeadline] = useState<string | null>(null)
  const [limited, setLimited] = useState<string | null>('2026-09-15')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 280 }}>
      <DatePicker
        value={deadline}
        onChange={setDeadline}
        allowClear
        placeholder="Pick a date…"
      />
      <DatePicker
        value={limited}
        onChange={setLimited}
        minDate={new Date(2026, 8, 1)}
        maxDate={new Date(2026, 8, 30)}
        label="Application deadline"
      />
    </div>
  )
}

export const CopyButtons = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <CopyButton value="copy-me" label="Copy value" />
    <CopyButton value="2026-08-30" label="Copy date" size={16} />
    <CopyButton value="" hideWhenEmpty={false} label="Copy empty" />
  </div>
)

export const BreadcrumbNav = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <Breadcrumbs homeHref="/" currentLabel="Dashboard" />
    <Breadcrumbs
      homeHref="/"
      items={[{ label: 'Doctors', href: '/doctors' }, { label: 'Dr. Mara' }]}
      currentLabel="Overview"
    />
    <Breadcrumbs items={[{ label: 'Settings' }]} />
  </div>
)
