import { Badge } from '../src/components/badge/Badge'
import { Button } from '../src/components/button/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../src/components/card/Card'

export const All = () => (
  <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
    <Card>
      <CardHeader>
        <CardTitle>Providers</CardTitle>
        <CardDescription>Connect AI providers and manage API keys.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'flex', gap: 8 }}>
        <Badge>openai</Badge>
        <Badge variant="secondary">anthropic</Badge>
        <Badge variant="success">connected</Badge>
      </CardContent>
      <CardFooter style={{ justifyContent: 'flex-end' }}>
        <Button size="sm">Add provider</Button>
      </CardFooter>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Task assignment</CardTitle>
        <CardDescription>Map tasks to models.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'grid', gap: 8 }}>
          <Badge variant="warning">summarize → gpt-mini</Badge>
          <Badge variant="danger">extract → local</Badge>
          <Badge variant="outline">chat → unset</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
)
