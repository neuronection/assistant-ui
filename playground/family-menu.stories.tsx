import type { ReactNode } from 'react'
import { FamilyMenu, defaultFamilyProjects } from '../src/components/family-menu'

const stage = (children: ReactNode) => (
  <div
    style={{
      minHeight: 760,
      padding: 32,
      background: 'var(--as-surface)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
    }}
  >
    <div style={{ width: 232, paddingBottom: 24 }}>{children}</div>
  </div>
)

export const Default = () =>
  stage(<FamilyMenu current="career" version="v0.16.0" defaultOpen />)

export const TriggerOnly = () =>
  stage(
    <FamilyMenu current="study" version="v0.16.0" />,
  )

export const CustomProjects = () =>
  stage(
    <FamilyMenu
      defaultOpen
      menuLabel="Neuronection family"
      version="v0.16.0"
      projects={[
        ...defaultFamilyProjects,
        {
          id: 'world-knowledge',
          name: 'World Knowledge',
          description: 'Structured knowledge packs for grounded answers.',
          href: 'https://neuronection.com',
          current: true,
        },
      ]}
    />,
  )
