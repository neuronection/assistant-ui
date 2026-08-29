import { Button } from '../src/components/button/Button'
import { Badge } from '../src/components/badge/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/card/Card'
import { ThemeScope } from '../src/components/theme-scope/ThemeScope'

export const AppFlavors = () => (
  <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
    <Card>
      <CardHeader>
        <CardTitle>Default family look</CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button size="sm">Primary</Button>
        <Badge>default</Badge>
      </CardContent>
    </Card>
    <ThemeScope tokens={{ '--as-primary': 'oklch(0.62 0.15 152)', '--as-primary-fg': 'white' }}>
      <Card>
        <CardHeader>
          <CardTitle>Career flavor</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size="sm">Primary</Button>
          <Badge>green</Badge>
        </CardContent>
      </Card>
    </ThemeScope>
    <ThemeScope tokens={{ '--as-primary': 'oklch(0.58 0.15 200)', '--as-radius': '1rem' }}>
      <Card>
        <CardHeader>
          <CardTitle>Health flavor</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size="sm">Primary</Button>
          <Badge>teal + round</Badge>
        </CardContent>
      </Card>
    </ThemeScope>
  </div>
)
