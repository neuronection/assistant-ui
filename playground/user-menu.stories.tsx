import { useState } from 'react'
import { Globe, LogOut, Moon, Settings } from 'lucide-react'
import { UserMenu, type UserMenuItem } from '../src/components/user-menu/UserMenu'

export const WithInitialsStory = () => {
  const [last, setLast] = useState('none')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <UserMenu
        name="Ilias Sdryom"
        email="ilias@neuronection.com"
        items={[
          { id: 'profile', label: 'Profile', icon: Settings },
          { id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' },
        ]}
        onItemSelect={setLast}
      />
      <p style={{ fontSize: 13 }}>Last action: {last}</p>
    </div>
  )
}

export const WithAvatarStory = () => (
  <UserMenu
    name="Maria Papadopoulou"
    email="maria@health-assistant.io"
    avatarUrl="/icon-light.svg"
    items={[{ id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' }]}
    onItemSelect={() => {}}
  />
)

export const CheckableItemsStory = () => {
  const [dark, setDark] = useState(false)
  const [lang, setLang] = useState<'en' | 'el'>('en')
  const items: UserMenuItem[] = [
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'theme', label: 'Dark theme', icon: Moon, checked: dark },
    {
      id: 'lang',
      label: 'Ελληνικά',
      icon: Globe,
      checked: lang === 'el',
    },
    { id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' },
  ]
  return (
    <UserMenu
      name="Ilias Sdryom"
      email="ilias@neuronection.com"
      items={items}
      onItemSelect={(id) => {
        if (id === 'theme') setDark((d) => !d)
        if (id === 'lang') setLang((l) => (l === 'en' ? 'el' : 'en'))
      }}
    />
  )
}

export const LongEmailStory = () => (
  <UserMenu
    email="very.long.account.name@subdomain.health-assistant-io.example.com"
    items={[{ id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' }]}
    onItemSelect={() => {}}
  />
)
