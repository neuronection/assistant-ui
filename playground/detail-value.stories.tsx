import { DetailValue } from '../src/components/detail-value/DetailValue'

export const PairRows = () => (
  <div style={{ maxWidth: 380 }}>
    <DetailValue text={'{"query": "nurse", "limit": 5, "sort": "relevance"}'} />
  </div>
)

export const ValueChips = () => (
  <div style={{ maxWidth: 380 }}>
    <DetailValue
      text='["ml-engineer", "game-developer", "graphic-designer", "architect", "data-scientist"]'
    />
  </div>
)

export const PlainTextPayload = () => (
  <div style={{ maxWidth: 380 }}>
    <DetailValue text={'Notification sent.\nNo follow-up needed.'} />
  </div>
)

export const NestedPayload = () => (
  <div style={{ maxWidth: 380 }}>
    <DetailValue
      text={'{"filters": {"level": "intern", "skills": ["python"]}, "limit": 10}'}
    />
  </div>
)
