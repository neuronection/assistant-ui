import { useState } from 'react'
import {
  MultiSelectPicker,
  type PickerOption,
  type PickerSelection,
} from '../src/components/multi-select-picker'

const skills: PickerOption[] = [
  { value: 'python', label: 'Python', category: 'Engineering' },
  { value: 'typescript', label: 'TypeScript', category: 'Engineering' },
  { value: 'react', label: 'React', category: 'Engineering' },
  { value: 'excel', label: 'Excel', category: 'Office' },
  { value: 'powerpoint', label: 'PowerPoint', category: 'Office' },
  { value: 'nursing', label: 'Nursing', category: 'Health' },
  { value: 'first-aid', label: 'First aid', category: 'Health' },
  { value: 'teaching', label: 'Teaching', category: 'Education' },
  { value: 'mentoring', label: 'Mentoring', category: 'Education' },
  { value: 'sales', label: 'Sales', category: 'Business' },
  { value: 'accounting', label: 'Accounting', category: 'Business' },
]

export const MultiSelect = () => {
  const [value, setValue] = useState<PickerSelection[]>(skills.slice(0, 1))
  return (
    <div style={{ maxWidth: 420 }}>
      <MultiSelectPicker
        options={skills}
        value={value}
        onChange={setValue}
        placeholder="Search skills…"
      />
      <p className="text-xs" style={{ marginTop: 8 }}>
        Selected: {value.map((entry) => entry.label).join(', ') || 'none'}
      </p>
    </div>
  )
}

export const SingleSelect = () => {
  const [value, setValue] = useState<PickerSelection[]>([])
  return (
    <div style={{ maxWidth: 420 }}>
      <MultiSelectPicker
        options={skills}
        value={value}
        onChange={setValue}
        mode="single"
        placeholder="Pick one skill…"
      />
    </div>
  )
}

export const ServerSearch = () => {
  const [value, setValue] = useState<PickerSelection[]>([])
  const search = (query: string) =>
    new Promise<PickerOption[]>((resolve) => {
      setTimeout(() => {
        resolve(
          skills.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()),
          ),
        )
      }, 300)
    })
  const loadMore = (_query: string, _category: string | null, offset: number) =>
    new Promise<PickerOption[]>((resolve) => {
      setTimeout(() => resolve(skills.slice(offset, offset + 3)), 300)
    })
  return (
    <div style={{ maxWidth: 420 }}>
      <MultiSelectPicker
        value={value}
        onChange={setValue}
        onSearch={search}
        onLoadMore={loadMore}
        placeholder="Search the server catalog…"
        labels={{ searchingLabel: 'Searching…' }}
      />
    </div>
  )
}
