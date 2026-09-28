import { useState } from 'react'
import {
  Briefcase,
  Globe,
  Info,
  LogOut,
  Moon,
  Settings,
  UserRound,
} from 'lucide-react'
import { UserMenu, type UserMenuItem } from '../src/components/user-menu/UserMenu'

export const WithInitialsStory = () => {
  const [last, setLast] = useState('none')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <UserMenu
        user={{ name: 'Ilias Sdryom', email: 'ilias@neuronection.com' }}
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
    user={{
      name: 'Maria Papadopoulou',
      email: 'maria@health-assistant.io',
      avatarUrl: '/icon-light.svg',
    }}
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
      user={{ name: 'Ilias Sdryom', email: 'ilias@neuronection.com' }}
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
    user={{ email: 'very.long.account.name@subdomain.health-assistant-io.example.com' }}
    items={[{ id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' }]}
    onItemSelect={() => {}}
  />
)

export const IdentityDropdownStory = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [lang, setLang] = useState('en')
  return (
    <UserMenu
      user={{ name: 'Ilias Sdryom', email: 'ilias@neuronection.com', role: 'ADMIN' }}
      roleBadge="Administrator"
      switcher={
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-[var(--as-radius-sm)] border border-[var(--as-border)] px-2 py-2 text-left text-sm"
        >
          <Briefcase aria-hidden className="size-4" />
          Workspace: Neuronection
        </button>
      }
      status={{ label: 'Synced', tone: 'success' }}
      labels={{ openMenu: 'Open user menu', account: 'Account' }}
      theme={theme}
      onThemeChange={setTheme}
      themeLabels={{ light: 'Light theme', dark: 'Dark theme', system: 'System theme' }}
      language={lang}
      onLanguageChange={setLang}
      languages={[
        { id: 'en', label: 'English' },
        { id: 'el', label: 'Ελληνικά' },
      ]}
      items={[
        { id: 'profile', label: 'My Profile', icon: UserRound },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'about', label: 'About', icon: Info },
      ]}
      onItemSelect={() => {}}
      onLogout={() => {}}
      logoutLabel="Log out"
    />
  )
}

export const ThemeInlineStory = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  return (
    <UserMenu
      user={{ name: 'Ilias Sdryom', email: 'ilias@neuronection.com' }}
      theme={theme}
      onThemeChange={setTheme}
      themeLabels={{ light: 'Light theme', dark: 'Dark theme', system: 'System theme' }}
      themeLayout="inline"
      items={[{ id: 'signout', label: 'Sign out', icon: LogOut, tone: 'danger' }]}
      onItemSelect={() => {}}
    />
  )
}
