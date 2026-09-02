import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { AboutCard } from '../src/components/about/AboutCard'
import { AboutLinkList } from '../src/components/about/AboutLinkList'
import { AboutNote } from '../src/components/about/AboutNote'
import { AboutFooterLine } from '../src/components/about/AboutFooterLine'
import { FamilyBadge } from '../src/components/about/FamilyBadge'
import { TechChips } from '../src/components/about/TechChips'
import { SponsorCard } from '../src/components/about/SponsorCard'
import { AboutPanel } from '../src/components/about/AboutPanel'

describe('AboutCard', () => {
  it('renders title, description and content', () => {
    render(
      <AboutCard title="License" description="Open source">
        Apache-2.0
      </AboutCard>,
    )
    expect(screen.getByText('License')).toBeInTheDocument()
    expect(screen.getByText('Open source')).toBeInTheDocument()
    expect(screen.getByText('Apache-2.0')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<AboutCard title="License">Apache-2.0</AboutCard>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('AboutLinkList', () => {
  const links = [
    { group: 'Project', href: 'https://github.com/x', label: 'GitHub', subtitle: '@org', external: true },
    { group: 'Project', href: '/about', label: 'Docs', external: false },
    { group: 'Creator', copyValue: 'x@y.z', label: 'x@y.z', subtitle: 'Click to copy' },
  ]

  it('renders anchors with external attributes only for external links', () => {
    render(<AboutLinkList links={links} />)
    const github = screen.getByRole('link', { name: /GitHub/ })
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noreferrer')
    const docs = screen.getByRole('link', { name: 'Docs' })
    expect(docs).not.toHaveAttribute('target')
  })

  it('renders label, subtitle and group headings', () => {
    render(<AboutLinkList links={links} />)
    expect(screen.getByText('@org')).toBeInTheDocument()
    expect(screen.getAllByText('Project').length).toBe(1)
    expect(screen.getAllByText('Creator').length).toBe(1)
  })

  it('copies copyValue rows to the clipboard with feedback', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<AboutLinkList links={links} />)
    const row = screen.getByRole('button', { name: /x@y\.z — Copy to clipboard/i })
    await user.click(row)
    expect(writeText).toHaveBeenCalledWith('x@y.z')
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('falls back to a default icon and marks rows with data hooks', () => {
    const { container } = render(<AboutLinkList links={[{ href: '/x', label: 'Bare' }]} />)
    expect(container.querySelector('[data-as="about-link-list"]')).toBeTruthy()
    expect(container.querySelector('[data-as="about-link-list"] svg')).toBeTruthy()
  })

  it('supports keyboard activation of links', async () => {
    const user = userEvent.setup()
    render(<AboutLinkList links={links} />)
    await user.tab()
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /x@y\.z — Copy to clipboard/i })).toHaveFocus()
  })

  it('has no axe violations', async () => {
    const { container } = render(<AboutLinkList links={links} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('AboutNote', () => {
  it('renders tone hook and title', () => {
    render(
      <AboutNote tone="warning" title="Medical disclaimer">
        Informational purposes only.
      </AboutNote>,
    )
    const note = screen.getByText('Medical disclaimer').parentElement
    expect(note).toHaveAttribute('data-as', 'about-note')
    expect(note).toHaveAttribute('data-as-tone', 'warning')
  })
})

describe('AboutFooterLine', () => {
  it('renders version and copyright', () => {
    render(<AboutFooterLine version="0.5.0" copyright="© 2026 Neuronection" />)
    expect(screen.getByText('0.5.0')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Neuronection')).toBeInTheDocument()
  })
})

describe('FamilyBadge', () => {
  it('marks the current app and links siblings to hub pages', () => {
    render(<FamilyBadge current="health" />)
    expect(
      screen.getByText('Health Assistant').closest('li[data-current]'),
    ).toBeTruthy()
    const careerTile = screen
      .getByRole('link', { name: 'Career Assistant on GitHub' })
      .closest('li') as HTMLElement
    const presentationLink = within(careerTile)
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === 'https://neuronection.com/en/career/')
    expect(presentationLink).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Career Assistant on GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/neuronection/career-assistant')
    expect(
      screen.getByRole('link', { name: 'Study Assistant on GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/neuronection/study-assistant')
    expect(
      screen.getByRole('link', { name: 'Health Assistant website' }),
    ).toHaveAttribute('href', 'https://health-assistant.io')
    expect(screen.getByRole('link', { name: 'Part of the Neuronection family' })).toHaveAttribute(
      'href',
      'https://neuronection.com',
    )
  })

  it('keeps the current app card clickable to its own hub page', () => {
    render(<FamilyBadge current="career" />)
    const tile = screen
      .getByText('Career Assistant')
      .closest('li[data-current]') as HTMLElement
    const link = within(tile)
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === 'https://neuronection.com/en/career/')
    expect(link).toBeTruthy()
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders the family blurb and prominent site CTA', () => {
    render(<FamilyBadge current="health" />)
    expect(screen.getByText(/open-source, self-hosted AI assistants/i)).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: /visit neuronection\.com/i })
    expect(cta).toHaveAttribute('href', 'https://neuronection.com')
    expect(cta).toHaveAttribute('data-as', 'family-cta')
  })

  it('accepts custom members', () => {
    render(
      <FamilyBadge
        current="study"
        members={[
          { app: 'health', name: 'Health', href: 'https://health-assistant.io' },
          { app: 'career', name: 'Career', href: 'https://example.com/career' },
          { app: 'study', name: 'Study', href: 'https://example.com/study' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute(
      'href',
      'https://health-assistant.io',
    )
  })

  it('supports keyboard navigation across the family links', async () => {
    const user = userEvent.setup()
    render(<FamilyBadge current="health" />)
    const expected = [
      'Part of the Neuronection family',
      'Visit neuronection.com',
      /Health Assistant/,
      'Health Assistant on GitHub',
      'Health Assistant website',
      /Career Assistant/,
      'Career Assistant on GitHub',
      /Study Assistant/,
      'Study Assistant on GitHub',
    ]
    for (const name of expected) {
      await user.tab()
      expect(document.activeElement).toHaveAccessibleName(name)
    }
  })

  it('renders an optional creator attribution', () => {
    render(
      <FamilyBadge
        current="health"
        creator={{
          name: 'Ilias Chatzopoulos',
          role: 'Founder & Lead Architect',
          href: 'https://github.com/constLiakos',
        }}
      />,
    )
    const link = screen.getByRole('link', { name: 'Ilias Chatzopoulos' })
    expect(link).toHaveAttribute('href', 'https://github.com/constLiakos')
    expect(screen.getByText(/Founder & Lead Architect/)).toBeInTheDocument()
    expect(screen.getByText('Created by')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<FamilyBadge current="health" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SponsorCard', () => {
  const Globe = ({ className }: { className?: string }) => (
    <svg className={className} aria-hidden />
  )
  const channels = [
    {
      id: 'buymeacoffee',
      name: 'Buy Me a Coffee',
      href: 'https://buymeacoffee.com/neuronection',
      description: 'One-time support',
      highlight: true,
    },
    {
      id: 'github',
      name: 'GitHub Sponsors',
      href: 'https://github.com/neuronection',
      icon: Globe,
    },
  ]

  it('renders channels with external attributes and data hooks', () => {
    const { container } = render(
      <SponsorCard
        title="Support the family"
        description="Funding keeps the servers running."
        channels={channels}
      />,
    )
    expect(container.querySelector('[data-as="sponsor-card"]')).toBeTruthy()
    const bmc = screen.getByRole('link', { name: /Buy Me a Coffee/ })
    expect(bmc).toHaveAttribute('href', 'https://buymeacoffee.com/neuronection')
    expect(bmc).toHaveAttribute('target', '_blank')
    expect(bmc).toHaveAttribute('rel', 'noreferrer')
    expect(bmc).toHaveAttribute('data-as-channel', 'buymeacoffee')
    expect(bmc).toHaveAttribute('data-as-highlight', 'true')
    const github = screen.getByRole('link', { name: /GitHub Sponsors/ })
    expect(github).toHaveAttribute('data-as-channel', 'github')
    expect(github).not.toHaveAttribute('data-as-highlight')
    expect(screen.getByText('Support the family')).toBeInTheDocument()
    expect(screen.getByText('Funding keeps the servers running.')).toBeInTheDocument()
    expect(screen.getByText('One-time support')).toBeInTheDocument()
  })

  it('defaults the channel list to a responsive grid, one column below sm', () => {
    const { container } = render(<SponsorCard channels={channels} />)
    const list = screen.getByRole('list', { name: 'Ways to support' })
    expect(list).toHaveClass('grid')
    expect(list).toHaveClass('grid-cols-1')
    expect(list).toHaveClass('sm:grid-cols-2')
    expect(container.querySelectorAll('[data-as-channel]')).toHaveLength(2)
  })

  it('columns={1} forces a single column for narrow surfaces', () => {
    render(<SponsorCard channels={channels} columns={1} />)
    const list = screen.getByRole('list', { name: 'Ways to support' })
    expect(list).toHaveClass('grid-cols-1')
    expect(list).not.toHaveClass('sm:grid-cols-2')
  })

  it('columns={2} forces two columns', () => {
    render(<SponsorCard channels={channels} columns={2} />)
    expect(screen.getByRole('list', { name: 'Ways to support' })).toHaveClass('grid-cols-2')
  })

  it('renders default title, description and footnote', () => {
    render(<SponsorCard channels={[{ id: 'x', name: 'X', href: 'https://x.dev' }]} />)
    expect(screen.getByText('Support this project')).toBeInTheDocument()
    expect(screen.getByText(/free and open source/)).toBeInTheDocument()
    expect(screen.getByText(/independent and free/)).toBeInTheDocument()
  })

  it('supports keyboard navigation across channels', async () => {
    const user = userEvent.setup()
    render(<SponsorCard channels={channels} />)
    await user.tab()
    expect(document.activeElement).toHaveAccessibleName(/Buy Me a Coffee/)
    await user.tab()
    expect(document.activeElement).toHaveAccessibleName(/GitHub Sponsors/)
  })

  it('renders nothing without channels', () => {
    const { container } = render(<SponsorCard channels={[]} />)
    expect(container.querySelector('[data-as="sponsor-card"]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<SponsorCard channels={channels} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('TechChips', () => {
  it('renders chips and skips empty entries', () => {
    const { container } = render(
      <TechChips items={['FastAPI', null, 'React 18', undefined]} />,
    )
    expect(container.querySelector('[data-as="tech-chips"]')).toBeTruthy()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
    expect(screen.getByText('React 18')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-as="chip-list"] span').length).toBe(2)
  })

  it('renders nothing without items', () => {
    const { container } = render(<TechChips items={[]} />)
    expect(container.querySelector('[data-as="tech-chips"]')).toBeNull()
  })
})

describe('AboutPanel', () => {
  const panel = (
    <AboutPanel
      appName="Health Assistant"
      familyCurrent="health"
      tagline="Universal Health Data Platform"
      description="Self-hosted, privacy-first health records."
      version="0.5.0"
      license={{ name: 'Apache License 2.0', href: 'https://www.apache.org/licenses/LICENSE-2.0' }}
      creator={{
        name: 'Ilias Chatzopoulos',
        role: 'Founder & Lead Architect',
        links: [{ href: 'https://github.com/constLiakos', label: 'constLiakos' }],
      }}
      tech={['FastAPI', 'React 18', 'HL7 FHIR']}
      note={{ tone: 'warning', title: 'Medical disclaimer', children: 'Not medical advice.' }}
      copyright="© 2026 Neuronection"
    />
  )

  it('composes hero, cards, note, family and footer', () => {
    render(panel)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Health Assistant' }),
    ).toBeInTheDocument()
    expect(screen.getByText('v0.5.0')).toBeInTheDocument()
    expect(screen.getByText('Apache License 2.0')).toBeInTheDocument()
    expect(screen.getByText('Ilias Chatzopoulos')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
    expect(screen.getByText('Not medical advice.')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Neuronection')).toBeInTheDocument()
  })

  it('exposes click handlers on composed links', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <AboutPanel
        appName="Health Assistant"
        links={[{ href: 'https://example.com', label: 'Website', external: false }]}
        onClick={onClick as never}
      >
        <button>Extra</button>
      </AboutPanel>,
    )
    const link = screen.getByRole('link', { name: 'Website' })
    link.addEventListener('click', onClick as never)
    await user.click(link)
    expect(onClick).toHaveBeenCalled()
  })

  it('renders the sponsor section when provided', () => {
    const { container } = render(
      <AboutPanel
        appName="Health Assistant"
        sponsor={{
          channels: [
            {
              id: 'buymeacoffee',
              name: 'Buy Me a Coffee',
              href: 'https://buymeacoffee.com/neuronection',
              highlight: true,
            },
          ],
        }}
      />,
    )
    const card = container.querySelector('[data-as="sponsor-card"]')
    expect(card).toBeTruthy()
    expect(
      within(card as HTMLElement).getByRole('link', { name: /Buy Me a Coffee/ }),
    ).toHaveAttribute('href', 'https://buymeacoffee.com/neuronection')
  })

  it('renders no sponsor section without the prop', () => {
    const { container } = render(<AboutPanel appName="Health Assistant" />)
    expect(container.querySelector('[data-as="sponsor-card"]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(panel)
    expect(await axe(container)).toHaveNoViolations()
  })
})
