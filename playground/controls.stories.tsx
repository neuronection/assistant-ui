import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CheckIndicator } from '../src/components/check-indicator/CheckIndicator'
import { SelectionBar } from '../src/components/selection-bar/SelectionBar'
import { ViewToggle, type ViewToggleView } from '../src/components/view-toggle/ViewToggle'
import { SearchInput } from '../src/components/search-input/SearchInput'
import { ExpandableSearch } from '../src/components/expandable-search/ExpandableSearch'
import { Button } from '../src/components/button/Button'

export const CheckIndicators = () => {
  const [checked, setChecked] = useState(false)
  const [mixed, setMixed] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <CheckIndicator checked={checked} label="Select item" onToggle={() => setChecked(!checked)} />
      <CheckIndicator
        checked={false}
        mixed={mixed}
        label="Select all"
        onToggle={() => setMixed(!mixed)}
      />
    </div>
  )
}

export const Selection = () => {
  const [count, setCount] = useState(3)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <SelectionBar count={count} onClear={() => setCount(0)}>
        <Button variant="outline" size="sm">
          Move
        </Button>
        <Button variant="outline" size="sm">
          <Trash2 aria-hidden />
          Delete
        </Button>
      </SelectionBar>
      <Button variant="outline" size="sm" onClick={() => setCount(3)}>
        Select three items
      </Button>
    </div>
  )
}

export const Views = () => {
  const [view, setView] = useState<ViewToggleView>('grid')
  return <ViewToggle view={view} onChange={setView} />
}

export const Searches = () => {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <SearchInput value={a} onChange={setA} placeholder="Search notes" ariaLabel="Search notes" />
      <ExpandableSearch value={b} onChange={setB} placeholder="Search library" ariaLabel="Search library" />
    </div>
  )
}
