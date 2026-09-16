import { Button } from '../src/components/button/Button'
import { Badge } from '../src/components/badge/Badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../src/components/hover-card/HoverCard'

export const Basic = () => (
  <div style={{ padding: 48 }}>
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost">chain-rule.pdf</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <strong>chain-rule.pdf</strong>
        <p style={{ margin: '6px 0' }}>
          Worked summary of the chain rule with examples and common pitfalls.
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          <Badge>derivatives</Badge>
          <Badge>calculus</Badge>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
)

export const FocusOnly = () => (
  <div style={{ padding: 48 }}>
    <HoverCard openDelay={80}>
      <HoverCardTrigger asChild>
        <Button variant="outline">Tab to me</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        Opens from keyboard focus alone — no pointer required.
      </HoverCardContent>
    </HoverCard>
  </div>
)
