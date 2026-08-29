import { useState } from 'react'
import { Calendar, Info } from 'lucide-react'
import { PopoverButton } from '../src/components/popover-button/PopoverButton'
import { InfoButton } from '../src/components/info-button/InfoButton'
import { FieldLabel } from '../src/components/field-label/FieldLabel'
import { Button } from '../src/components/button/Button'

export const Default = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <PopoverButton label="Filters" trigger={<Calendar aria-hidden />}>
      <p className="text-sm">Filter content lives here.</p>
    </PopoverButton>
    <PopoverButton label="Info" trigger={<Info aria-hidden />} openOnHover>
      <p className="text-sm">Opens on hover, stays for content.</p>
    </PopoverButton>
    <PopoverButton
      label="Form"
      trigger={<span>Open</span>}
      triggerClassName="px-3 py-1.5 text-sm"
      align="start"
      panelClassName="w-64"
    >
      {() => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Lazy content</p>
          <p className="text-xs">Rendered only while open.</p>
        </div>
      )}
    </PopoverButton>
  </div>
)

export const InfoAffordances = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div>
      <FieldLabel info={<span>Appears for the whole row on hover.</span>} infoTitle="Row settings">
        Default model
      </FieldLabel>
    </div>
    <div>
      <FieldLabel info="Always visible." showOnHover={false} label="About">
        Context length
      </FieldLabel>
    </div>
    <div>
      <span className="text-xs">Standalone: </span>
      <InfoButton title="What is this?">
        <span>Explains the adjacent control in plain language.</span>
      </InfoButton>
    </div>
  </div>
)

export const ControlledClose = () => {
  const [closeSignal, setCloseSignal] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <PopoverButton label="Panel" trigger={<span>Open</span>} triggerClassName="px-3 py-1.5 text-sm" closeSignal={closeSignal}>
        <p className="text-sm">This panel can be closed from outside.</p>
      </PopoverButton>
      <Button variant="outline" size="sm" onClick={() => setCloseSignal((n) => n + 1)}>
        Close panel
      </Button>
    </div>
  )
}
