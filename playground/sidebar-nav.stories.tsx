import { useState } from 'react'
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Home,
  Info,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react'
import { SidebarNav, type NavItem } from '../src/components/sidebar-nav/SidebarNav'

const flat: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'catalogs', label: 'Catalogs', icon: BookOpen, badge: 12 },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'about', label: 'About', icon: Info },
]

const grouped: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  {
    id: 'record',
    label: 'Patient record',
    icon: User,
    children: [
      { id: 'overview', label: 'Overview' },
      { id: 'exams', label: 'Examinations', section: 'Clinical record' },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'medications', label: 'Medications', icon: Pill, section: 'Treatments & alerts' },
      { id: 'events', label: 'Events', icon: Calendar, section: 'Timeline', badge: 4 },
    ],
  },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '9+' },
  {
    id: 'admin',
    label: 'Administration',
    icon: ShieldCheck,
    children: [
      { id: 'tenants', label: 'Tenants' },
      { id: 'users', label: 'Users' },
    ],
  },
  { id: 'about', label: 'About', icon: Info },
]

export const FlatStory = () => {
  const [active, setActive] = useState('dashboard')
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <SidebarNav items={flat} activeId={active} onNavigate={setActive} />
      <p style={{ fontSize: 14, padding: 16 }}>Route: {active}</p>
    </div>
  )
}

export const GroupsStory = () => {
  const [active, setActive] = useState('exams')
  return (
    <div style={{ display: 'flex', height: 420 }}>
      <SidebarNav
        items={grouped}
        activeId={active}
        onNavigate={setActive}
        header={<div style={{ padding: "16px 20px 8px" }}><span style={{ fontWeight: 700 }}>Health Assistant</span></div>}
        footer={<span style={{ fontSize: 12, opacity: 0.6 }}>v2.3.1</span>}
      />
      <p style={{ fontSize: 14, padding: 16 }}>Route: {active}</p>
    </div>
  )
}

export const SectionedStory = () => {
  const [active, setActive] = useState('/')
  return (
    <div style={{ display: 'flex', height: 420 }}>
      <SidebarNav
        items={[
          { id: '/', label: 'Dashboard', icon: Home },
          { id: '/catalog', label: 'Catalog', icon: BookOpen, section: 'Job hunt' },
          { id: '/generate', label: 'Generate', icon: Sparkles, section: 'Job hunt' },
          { id: '/rankings', label: 'Rankings', icon: Trophy, section: 'Job hunt' },
          { id: '/explore', label: 'Explore', icon: Search, section: 'Job hunt' },
          { id: '/profile', label: 'Profile', icon: User, section: 'Account' },
          { id: '/settings', label: 'Settings', icon: ShieldCheck, section: 'General' },
          { id: '/about', label: 'About', icon: Info },
        ]}
        activeId={active}
        onNavigate={setActive}
        footer={
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Part of Neuronection
          </span>
        }
      />
      <p style={{ fontSize: 14, padding: 16 }}>Route: {active}</p>
    </div>
  )
}

export const SecondaryItemsStory = () => {
  const [active, setActive] = useState('/catalog')
  return (
    <div style={{ display: 'flex', height: 420 }}>
      <SidebarNav
        items={[
          { id: '/', label: 'Dashboard', icon: Home },
          { id: '/catalog', label: 'Catalog', icon: BookOpen, section: 'Job hunt' },
          { id: '/generate', label: 'Generate', icon: Sparkles, section: 'Job hunt' },
          { id: '/profile', label: 'Profile', icon: User, section: 'Account' },
        ]}
        secondaryItems={[
          { id: '/settings', label: 'Settings', icon: ShieldCheck },
          { id: '/about', label: 'About', icon: Info },
        ]}
        activeId={active}
        onNavigate={setActive}
        footer={
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Part of Neuronection
          </span>
        }
      />
      <p style={{ fontSize: 14, padding: 16 }}>Route: {active}</p>
    </div>
  )
}

export const CompactStory = () => {
  const [active, setActive] = useState('/catalog')
  return (
    <div style={{ display: 'flex', height: 300 }}>
      <SidebarNav
        items={[
          { id: '/', label: 'Dashboard', icon: Home },
          { id: '/catalog', label: 'Catalog', icon: BookOpen, section: 'Job hunt' },
          { id: '/generate', label: 'Generate', icon: Sparkles, section: 'Job hunt' },
          { id: '/profile', label: 'Profile', icon: User, section: 'Account' },
        ]}
        secondaryItems={[{ id: '/settings', label: 'Settings', icon: ShieldCheck }]}
        activeId={active}
        onNavigate={setActive}
        compact
        footer={
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Part of Neuronection
          </span>
        }
      />
      <p style={{ fontSize: 14, padding: 16 }}>
        Denser layout for short viewports — the app owns the trigger
        (e.g. a max-height media query).
      </p>
    </div>
  )
}

export const CollapsedRailStory = () => {
  const [active, setActive] = useState('exams')
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div style={{ display: 'flex', height: 420 }}>
      <SidebarNav
        items={grouped}
        activeId={active}
        onNavigate={setActive}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapsible
        header={<div style={{ padding: "16px 20px 8px" }}><span style={{ fontWeight: 700 }}>HA</span></div>}
      />
      <p style={{ fontSize: 14, padding: 16 }}>
        Rail {collapsed ? 'collapsed' : 'expanded'} — hover the record icon
        for the flyout.
      </p>
    </div>
  )
}

export const DisabledStory = () => {
  const [active, setActive] = useState('dashboard')
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <SidebarNav
        items={[
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'locked', label: 'Locked area', disabled: true },
          { id: 'empty', label: 'Filtered out', children: [] },
        ]}
        activeId={active}
        onNavigate={setActive}
      />
      <p style={{ fontSize: 14, padding: 16 }}>Route: {active}</p>
    </div>
  )
}
