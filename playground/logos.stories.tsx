import { CareerMark } from '../src/components/logo/CareerMark'
import { HealthMark } from '../src/components/logo/HealthMark'
import { StudyMark } from '../src/components/logo/StudyMark'
import { NeuronectionMark } from '../src/components/logo/NeuronectionMark'
import { NeuronectionWordmark } from '../src/components/logo/NeuronectionWordmark'

const Surface = ({
  dark,
  children,
}: {
  dark?: boolean
  children: React.ReactNode
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: 24,
      borderRadius: 16,
      background: dark ? '#0b1220' : '#f8fafc',
    }}
  >
    {children}
  </div>
)

export const AppMarks = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <Surface>
      <CareerMark size={52} theme="light" />
      <HealthMark size={52} theme="light" />
      <StudyMark size={52} theme="light" />
    </Surface>
    <Surface dark>
      <CareerMark size={52} theme="dark" />
      <HealthMark size={52} theme="dark" />
      <StudyMark size={52} theme="dark" />
    </Surface>
  </div>
)

export const NeuronectionBrand = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <Surface>
      <NeuronectionMark size={64} theme="light" />
      <NeuronectionWordmark size={28} theme="light" />
    </Surface>
    <Surface dark>
      <NeuronectionMark size={64} theme="dark" />
      <NeuronectionWordmark size={28} theme="dark" />
    </Surface>
  </div>
)

export const MonoWordmark = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div style={{ color: '#0f172a' }}>
      <NeuronectionWordmark size={22} mono />
    </div>
    <div style={{ color: '#e2e8f0' }}>
      <NeuronectionWordmark size={22} mono />
    </div>
  </div>
)

export const LabeledAndSized = () => (
  <Surface>
    <NeuronectionMark size={24} title="Neuronection" />
    <CareerMark size={40} title="Career Assistant" />
    <StudyMark size={56} title="Study Assistant" />
    <HealthMark size={72} title="Health Assistant" />
  </Surface>
)
