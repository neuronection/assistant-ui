import { useState } from 'react'
import { Layers, Palette, LayoutList, Trophy } from 'lucide-react'
import { SegmentedTabs } from '../src/components/segmented-tabs/SegmentedTabs'

const items = [
  { value: 'context', label: 'Context', icon: Layers },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'sections', label: 'Sections', icon: LayoutList },
]

export const ThreeTabs = () => {
  const [value, setValue] = useState('context')
  return (
    <div style={{ maxWidth: 320 }}>
      <SegmentedTabs items={items} value={value} onValueChange={setValue} ariaLabel="Inspector panels" />
    </div>
  )
}

export const ManyTabs = () => {
  const [value, setValue] = useState('all')
  return (
    <div style={{ maxWidth: 560 }}>
      <SegmentedTabs
        items={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'draft', label: 'Drafts' },
          { value: 'archived', label: 'Archived' },
          { value: 'awards', label: 'Awards', icon: Trophy },
        ]}
        value={value}
        onValueChange={setValue}
        ariaLabel="Filter views"
      />
    </div>
  )
}

export const WrappedTabs = () => {
  const [value, setValue] = useState('retrieval')
  return (
    <div style={{ maxWidth: 560 }}>
      <SegmentedTabs
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'ai', label: 'AI activity' },
          { value: 'usage', label: 'Usage & throughput' },
          { value: 'security', label: 'Security & access' },
          { value: 'jobs', label: 'Jobs & runs' },
          { value: 'failures', label: 'Failures' },
          { value: 'changes', label: 'Data changes' },
          { value: 'retrieval', label: 'Retrieval' },
        ]}
        value={value}
        onValueChange={setValue}
        ariaLabel="Audit views"
        wrap
      />
    </div>
  )
}

export const WithDisabled = () => {
  const [value, setValue] = useState('design')
  return (
    <div style={{ maxWidth: 320 }}>
      <SegmentedTabs
        items={[
          { value: 'context', label: 'Context', disabled: true },
          { value: 'design', label: 'Design', icon: Palette },
          { value: 'sections', label: 'Sections', icon: LayoutList },
        ]}
        value={value}
        onValueChange={setValue}
        ariaLabel="Panels"
      />
    </div>
  )
}
