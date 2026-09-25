import { useState } from 'react'

import {
  ProfileSwitcher,
  type ProfileItem,
} from '../src/components/profile-switcher/ProfileSwitcher'

const seed: ProfileItem[] = [
  { id: 'p-default', name: 'Default', is_default: true },
  { id: 'p-berlin', name: 'Berlin move', color: '#3366ff' },
  { id: 'p-cairo', name: 'Gap year', color: '#c2410c' },
]

export const Default = () => {
  const [profiles, setProfiles] = useState(seed)
  const [currentId, setCurrentId] = useState('p-default')
  return (
    <ProfileSwitcher
      profiles={profiles}
      currentId={currentId}
      onSelect={(profile) => setCurrentId(profile.id)}
      onCreate={(name) =>
        setProfiles((rows) => [
          ...rows,
          { id: `p-${Date.now()}`, name, is_default: false },
        ])
      }
      onRename={(profile, name) =>
        setProfiles((rows) =>
          rows.map((row) => (row.id === profile.id ? { ...row, name } : row)),
        )
      }
      onDelete={(profile) =>
        setProfiles((rows) => rows.filter((row) => row.id !== profile.id))
      }
      onSetDefault={(profile) =>
        setProfiles((rows) =>
          rows.map((row) => ({ ...row, is_default: row.id === profile.id })),
        )
      }
    />
  )
}

export const WithoutColors = () => {
  const [currentId, setCurrentId] = useState('p-default')
  return (
    <ProfileSwitcher
      profiles={seed.map((profile) => ({ ...profile, color: null }))}
      currentId={currentId}
      onSelect={(profile) => setCurrentId(profile.id)}
      onCreate={() => undefined}
      onRename={() => undefined}
      onDelete={() => undefined}
    />
  )
}

export const LoadingAndError = () => (
  <div className="flex flex-col items-start gap-3">
    <ProfileSwitcher
      profiles={[]}
      currentId={null}
      loading
      onSelect={() => undefined}
      onCreate={() => undefined}
      onRename={() => undefined}
      onDelete={() => undefined}
    />
    <ProfileSwitcher
      profiles={seed}
      currentId="p-berlin"
      error="Could not save the profile — try again."
      onSelect={() => undefined}
      onCreate={() => undefined}
      onRename={() => undefined}
      onDelete={() => undefined}
    />
  </div>
)

export const CustomLabels = () => {
  const [currentId, setCurrentId] = useState('p-berlin')
  return (
    <ProfileSwitcher
      profiles={seed}
      currentId={currentId}
      labels={{
        trigger: 'Προφίλ',
        panelTitle: 'Τα προφίλ μου',
        create: 'Δημιουργία',
        newProfile: 'Νέο προφίλ',
      }}
      onSelect={(profile) => setCurrentId(profile.id)}
      onCreate={() => undefined}
      onRename={() => undefined}
      onDelete={() => undefined}
    />
  )
}
