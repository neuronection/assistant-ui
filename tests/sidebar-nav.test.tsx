import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Bell, BookOpen, ShieldCheck, User } from 'lucide-react'
import {
  SidebarNav,
  type NavItem,
} from '../src/components/sidebar-nav/SidebarNav'

const flatItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Bell },
  { id: 'catalogs', label: 'Catalogs', icon: BookOpen, badge: 3 },
  { id: 'about', label: 'About' },
]

const groupItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Bell },
  {
    id: 'record',
    label: 'Patient record',
    icon: User,
    children: [
      { id: 'overview', label: 'Overview' },
      { id: 'exams', label: 'Examinations', section: 'Clinical record' },
      { id: 'biomarkers', label: 'Biomarkers', section: 'Clinical record' },
      { id: 'events', label: 'Events', section: 'Timeline' },
    ],
  },
  { id: 'admin', label: 'Administration', icon: ShieldCheck, badge: '!' },
]

function FlatDemo(props: Partial<React.ComponentProps<typeof SidebarNav>>) {
  const [active, setActive] = React.useState<string | null>('dashboard')
  return (
    <div style={{ height: 400 }}>
      <SidebarNav
        items={flatItems}
        activeId={active}
        onNavigate={setActive}
        {...props}
      />
    </div>
  )
}

function GroupDemo(props: Partial<React.ComponentProps<typeof SidebarNav>>) {
  const [active, setActive] = React.useState<string | null>('dashboard')
  return (
    <div style={{ height: 400 }}>
      <SidebarNav
        items={groupItems}
        activeId={active}
        onNavigate={setActive}
        {...props}
      />
    </div>
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('SidebarNav (flat)', () => {
  it('renders items with labels, icons and a labelled nav region', () => {
    render(<FlatDemo />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Catalogs/ })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // badge
  })

  it('renders header and footer slots', () => {
    render(<FlatDemo header={<span>Brand</span>} footer={<span>v1.0</span>} />)
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
  })

  it('marks the active item with aria-current and navigates on click', async () => {
    const user = userEvent.setup()
    render(<FlatDemo />)
    const catalogs = screen.getByRole('button', { name: /Catalogs/ })
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(catalogs)
    expect(catalogs).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('disables disabled items', () => {
    render(<FlatDemo items={[{ id: 'x', label: 'Locked', disabled: true }]} />)
    expect(screen.getByRole('button', { name: 'Locked' })).toBeDisabled()
  })

  it('respects a translated nav aria-label', () => {
    render(<FlatDemo labels={{ navAria: 'Hauptnavigation' }} />)
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<FlatDemo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SidebarNav (groups)', () => {
  it('toggles group expansion on click without navigating', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<GroupDemo onNavigate={onNavigate} />)
    const trigger = screen.getByRole('button', { name: 'Patient record' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('renders each section divider once, at its first child', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    await user.click(screen.getByRole('button', { name: 'Patient record' }))
    expect(screen.getAllByText('Clinical record')).toHaveLength(1)
    expect(screen.getAllByText('Timeline')).toHaveLength(1)
  })

  it('auto-expands the group containing the active child', () => {
    render(<GroupDemo activeId="exams" />)
    expect(screen.getByRole('button', { name: 'Patient record' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Examinations' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('highlights the group when the group id itself is active', () => {
    render(<GroupDemo activeId="admin" />)
    const admin = screen.getByRole('button', { name: /Administration/ })
    expect(admin).toHaveAttribute('aria-current', 'page')
  })

  it('renders nothing for a group whose children were all filtered out', () => {
    render(<GroupDemo items={[{ id: 'empty', label: 'Empty', children: [] }]} />)
    expect(screen.queryByRole('button', { name: 'Empty' })).toBeNull()
  })

  it('respects controlled expandedIds and reports changes', async () => {
    const user = userEvent.setup()
    const onExpandedIdsChange = vi.fn()
    render(
      <GroupDemo expandedIds={[]} onExpandedIdsChange={onExpandedIdsChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Patient record' }))
    expect(onExpandedIdsChange).toHaveBeenCalledWith(['record'])
    // still collapsed — the app owns the state and did not apply it
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull()
  })

  it('skips auto-expand in controlled mode', () => {
    render(
      <GroupDemo expandedIds={['record']} onExpandedIdsChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
  })

  it('keyboard: ArrowDown/ArrowUp move focus across visible items', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    const dashboard = screen.getByRole('button', { name: 'Dashboard' })
    const record = screen.getByRole('button', { name: 'Patient record' })
    dashboard.focus()
    await user.keyboard('{ArrowDown}')
    expect(record).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(dashboard).toHaveFocus()
  })

  it('keyboard: Home/End jump to first/last visible item', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    const first = screen.getByRole('button', { name: 'Dashboard' })
    const last = screen.getByRole('button', { name: /Administration/ })
    first.focus()
    await user.keyboard('{End}')
    expect(last).toHaveFocus()
    await user.keyboard('{Home}')
    expect(first).toHaveFocus()
  })

  it('keyboard: ArrowRight expands a group, ArrowLeft collapses it', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    const record = screen.getByRole('button', { name: 'Patient record' })
    record.focus()
    await user.keyboard('{ArrowRight}')
    expect(record).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{ArrowLeft}')
    expect(record).toHaveAttribute('aria-expanded', 'false')
  })

  it('keyboard: ArrowRight on an expanded group focuses its first child; ArrowLeft returns to the trigger', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    const record = screen.getByRole('button', { name: 'Patient record' })
    record.focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(record).toHaveFocus()
  })

  it('keyboard: arrow navigation skips children of collapsed groups', async () => {
    const user = userEvent.setup()
    render(<GroupDemo />)
    // expand the record group so its children join the visible list
    await user.click(screen.getByRole('button', { name: 'Patient record' }))
    const first = screen.getByRole('button', { name: 'Dashboard' })
    const last = screen.getByRole('button', { name: /Administration/ })
    last.focus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: 'Events' })).toHaveFocus()
    first.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: 'Patient record' })).toHaveFocus()
  })

  it('fires onNavigate only for leaves, with the leaf id', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<GroupDemo onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Patient record' }))
    await user.click(screen.getByRole('button', { name: 'Overview' }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith('overview')
  })

  it('has no axe violations with an expanded group and sections', async () => {
    const user = userEvent.setup()
    const { container } = render(<GroupDemo />)
    await user.click(screen.getByRole('button', { name: 'Patient record' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SidebarNav (top-level sections)', () => {
  const sectioned: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Bell },
    { id: 'catalog', label: 'Catalog', icon: BookOpen, section: 'Job hunt' },
    { id: 'generate', label: 'Generate', section: 'Job hunt' },
    { id: 'profile', label: 'Profile', section: 'Account' },
    { id: 'about', label: 'About' },
  ]

  it('renders each section divider once, above its first item', () => {
    render(<SidebarNav items={sectioned} activeId="catalog" />)
    expect(screen.getAllByText('Job hunt')).toHaveLength(1)
    expect(screen.getAllByText('Account')).toHaveLength(1)
    const catalog = screen.getByRole('button', { name: 'Catalog' })
    const divider = screen.getByText('Job hunt')
    expect(divider.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('items without a section render without a preceding divider', () => {
    render(<SidebarNav items={sectioned} activeId="dashboard" />)
    expect(screen.queryByText('Dashboard')).toBeInTheDocument()
  })

  it('has no axe violations with sections', async () => {
    const { container } = render(<SidebarNav items={sectioned} activeId="catalog" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('collapsed rail ignores sections', () => {
    render(<SidebarNav items={sectioned} activeId="catalog" collapsed />)
    expect(screen.queryByText('Job hunt')).toBeNull()
    expect(screen.queryByText('Account')).toBeNull()
  })
})

describe('SidebarNav (collapsed rail)', () => {
  it('renders icon-only buttons with titles instead of labels', () => {
    render(<FlatDemo collapsed collapsible />)
    const catalogs = screen.getByRole('button', { name: /Catalogs/ })
    expect(screen.queryByText('Catalogs')).toBeNull()
    expect(catalogs).toHaveAttribute('title', 'Catalogs')
    expect(catalogs).toHaveAttribute('aria-label', 'Catalogs')
  })

  it('toggle handle reports onCollapsedChange', async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    render(<FlatDemo collapsed={false} collapsible onCollapsedChange={onCollapsedChange} />)
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('handle aria-labels come from labels', () => {
    render(
      <FlatDemo
        collapsed
        collapsible
        labels={{ expand: 'Seite ausklappen', collapse: 'Seite einklappen' }}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Seite ausklappen' }),
    ).toBeInTheDocument()
  })

  it('no handle rendered without collapsible', () => {
    render(<FlatDemo collapsed />)
    expect(screen.queryByRole('button', { name: /sidebar/i })).toBeNull()
  })

  it('group opens a flyout on click; child navigates and closes it', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<GroupDemo collapsed collapsible onNavigate={onNavigate} />)
    const trigger = screen.getByRole('button', { name: 'Open Patient record menu' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    await user.click(trigger)
    const overview = screen.getByRole('button', { name: 'Overview' })
    expect(overview).toBeInTheDocument()
    await user.click(overview)
    expect(onNavigate).toHaveBeenCalledWith('overview')
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull()
  })

  it('group flyout opens on hover after the debounce and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<GroupDemo collapsed collapsible />)
    const trigger = screen.getByRole('button', { name: 'Open Patient record menu' })
    fireEvent.mouseEnter(trigger)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument(),
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull()
  })

  it('keyboard Escape from a click-opened flyout returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<GroupDemo collapsed collapsible />)
    const trigger = screen.getByRole('button', { name: 'Open Patient record menu' })
    await user.click(trigger)
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('flyout arrows move focus between children', async () => {
    const user = userEvent.setup()
    render(<GroupDemo collapsed collapsible />)
    await user.click(
      screen.getByRole('button', { name: 'Open Patient record menu' }),
    )
    const overview = screen.getByRole('button', { name: 'Overview' })
    overview.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: 'Examinations' })).toHaveFocus()
  })

  it('rail leaf keyboard activation navigates', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<FlatDemo collapsed onNavigate={onNavigate} />)
    const catalogs = screen.getByRole('button', { name: /Catalogs/ })
    catalogs.focus()
    await user.keyboard('{Enter}')
    expect(onNavigate).toHaveBeenCalledWith('catalogs')
  })

  it('has no axe violations collapsed with flyout open', async () => {
    const user = userEvent.setup()
    render(<GroupDemo collapsed collapsible activeId="exams" />)
    await user.click(
      screen.getByRole('button', { name: 'Open Patient record menu' }),
    )
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  })
})

describe('SidebarNav (secondary items)', () => {
  const secondary: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: ShieldCheck },
    { id: 'help', label: 'Help', icon: BookOpen },
  ]

  function SecondaryDemo(props: Partial<React.ComponentProps<typeof SidebarNav>>) {
    const [active, setActive] = React.useState<string | null>('dashboard')
    return (
      <div style={{ height: 400 }}>
        <SidebarNav
          items={flatItems}
          secondaryItems={secondary}
          activeId={active}
          onNavigate={setActive}
          {...props}
        />
      </div>
    )
  }

  it('renders pinned items below the main list, after a divider', () => {
    const { container } = render(<SecondaryDemo />)
    const last = screen.getByRole('button', { name: 'Help' })
    const main = screen.getByRole('button', { name: 'Dashboard' })
    expect(
      main.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(container.querySelectorAll('ul.space-y-1')).toHaveLength(2)
  })

  it('navigates and marks the active pinned item', async () => {
    const user = userEvent.setup()
    render(<SecondaryDemo />)
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('keyboard: arrows and End traverse from the main list into pinned items', async () => {
    const user = userEvent.setup()
    render(<SecondaryDemo />)
    const first = screen.getByRole('button', { name: 'Dashboard' })
    const lastMain = screen.getByRole('button', { name: 'About' })
    lastMain.focus()
    await user.keyboard('{Home}')
    expect(first).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus()
    const settings = screen.getByRole('button', { name: 'Settings' })
    settings.focus()
    await user.keyboard('{ArrowUp}')
    expect(lastMain).toHaveFocus()
  })

  it('renders pinned items icon-only with titles in the collapsed rail', () => {
    render(<SecondaryDemo collapsed />)
    expect(screen.queryByText('Settings')).toBeNull()
    const settings = screen.getByRole('button', { name: 'Settings' })
    expect(settings).toHaveAttribute('title', 'Settings')
    expect(settings).toHaveAttribute('aria-label', 'Settings')
  })

  it('renders no pinned region when secondaryItems is empty or omitted', () => {
    const { container, rerender } = render(<SecondaryDemo secondaryItems={[]} />)
    expect(container.querySelectorAll('ul.space-y-1')).toHaveLength(1)
    rerender(<FlatDemo />)
    expect(container.querySelectorAll('ul.space-y-1')).toHaveLength(1)
  })

  it('has no axe violations with pinned items', async () => {
    const { container } = render(<SecondaryDemo activeId="settings" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SidebarNav (compact)', () => {
  const secondary: NavItem[] = [{ id: 'settings', label: 'Settings', icon: ShieldCheck }]

  function CompactDemo(props: Partial<React.ComponentProps<typeof SidebarNav>>) {
    const [active, setActive] = React.useState<string | null>('dashboard')
    return (
      <div style={{ height: 300 }}>
        <SidebarNav
          items={flatItems}
          secondaryItems={secondary}
          activeId={active}
          onNavigate={setActive}
          footer={<span>v1.0</span>}
          compact
          {...props}
        />
      </div>
    )
  }

  it('marks the nav root and renders denser items, regions and footer', () => {
    const { container } = render(<CompactDemo />)
    expect(container.querySelector('nav[data-as-compact]')).toBeInTheDocument()
    const item = screen.getByRole('button', { name: 'Dashboard' })
    expect(item.className).toContain('py-1.5')
    expect(item.className).toContain('text-xs')
    expect(item.className).not.toContain('py-2.5')
    // list + pinned regions and the footer wrapper all slim down
    const denseLists = Array.from(container.querySelectorAll('ul')).filter((ul) =>
      ul.classList.contains('space-y-0.5'),
    )
    expect(denseLists).toHaveLength(2)
    expect(container.querySelector('nav > div.border-t.p-3')).toBeNull()
    expect(container.textContent).toContain('v1.0')
  })

  it('keeps the default density without the prop', () => {
    const { container } = render(<FlatDemo />)
    expect(container.querySelector('nav[data-as-compact]')).toBeNull()
    const item = screen.getByRole('button', { name: 'Dashboard' })
    expect(item.className).toContain('py-2.5')
    expect(container.querySelectorAll('ul.space-y-1')).toHaveLength(1)
  })

  it('keyboard traversal is unchanged in compact mode', async () => {
    const user = userEvent.setup()
    render(<CompactDemo />)
    screen.getByRole('button', { name: 'About' }).focus()
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: 'About' })).toHaveFocus()
  })

  it('has no axe violations in compact mode', async () => {
    const { container } = render(<CompactDemo activeId="dashboard" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

