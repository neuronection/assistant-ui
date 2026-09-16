import { Card, CardContent, CardHeader } from '../src/components/card/Card'
import { Skeleton, SkeletonText } from '../src/components/skeleton/Skeleton'

export const Blocks = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Skeleton className="size-10 rounded-full" />
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-24 w-full" />
  </div>
)

export const TextLines = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420 }}>
    <SkeletonText lines={3} />
    <SkeletonText lines={5} lastLineRatio={0.6} />
    <SkeletonText lines={1} />
  </div>
)

export const CardPlaceholder = () => (
  <div style={{ maxWidth: 360 }} aria-busy="true">
    <Card>
      <CardHeader>
        <Skeleton className="mb-2 h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
      <CardContent>
        <SkeletonText lines={4} />
      </CardContent>
    </Card>
  </div>
)

export const ListRows = () => (
  <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
    {[0, 1, 2].map((row) => (
      <div key={row} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton className="size-9 rounded-full" />
        <div style={{ flex: 1 }}>
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
)
