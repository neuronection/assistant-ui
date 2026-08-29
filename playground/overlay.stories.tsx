import { Button } from '../src/components/button/Button'
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/popover/Popover'
import {
  InfoTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/tooltip'

export const Popovers = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align center</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Quick actions</p>
        <p style={{ fontSize: 14, color: 'var(--as-muted-fg)' }}>
          Content, sides and alignment are Radix-powered.
        </p>
      </PopoverContent>
    </Popover>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align end</Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom">
        <p style={{ fontSize: 14 }}>Aligned to the trigger end.</p>
      </PopoverContent>
    </Popover>
  </div>
)

export const Tooltips = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Plain tooltip content</TooltipContent>
      </Tooltip>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        With info icon <InfoTooltip content="Field-level help via hover" title="Help" />
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Click mode <InfoTooltip content="Rich help popover for longer explanations." title="About this field" trigger="click" />
      </span>
    </div>
  </TooltipProvider>
)
