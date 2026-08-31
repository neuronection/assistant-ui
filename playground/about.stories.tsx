import { Globe, ShieldCheck } from 'lucide-react'
import { AboutPanel } from '../src/components/about/AboutPanel'
import { AboutCard } from '../src/components/about/AboutCard'
import { AboutLinkList } from '../src/components/about/AboutLinkList'
import { AboutNote } from '../src/components/about/AboutNote'
import { FamilyBadge } from '../src/components/about/FamilyBadge'
import { SponsorCard } from '../src/components/about/SponsorCard'
import { TechChips } from '../src/components/about/TechChips'

export const HealthAboutPage = () => (
  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    <AboutPanel
      appName="Health Assistant"
      familyCurrent="health"
      tagline="Universal Health Data Platform"
      description="A self-hosted, privacy-first platform that centralizes health records, analyzes biomarkers and provides intelligent insights while keeping your data in your hands."
      version="0.5.0"
      license={{
        name: 'Apache License 2.0',
        href: 'https://www.apache.org/licenses/LICENSE-2.0',
      }}
      creator={{
        name: 'Ilias Chatzopoulos',
        role: 'Founder & Lead Architect',
        href: 'https://github.com/constLiakos',
      }}
      tech={[
        'FastAPI',
        'Celery + Redis',
        'PostgreSQL + TimescaleDB',
        'HL7 FHIR',
        'React 18 + Vite (PWA)',
        'Docker Compose',
        'Apache-2.0',
      ]}
      note={{
        tone: 'warning',
        title: 'Medical disclaimer',
        children:
          'This software is for informational and wellness purposes only. It does not provide medical diagnosis or substitute professional medical care.',
      }}
      sponsor={{
        title: 'Keep Health Assistant alive',
        description:
          'Health Assistant is free and open source. Your support funds servers, maintenance and the future of the whole Neuronection family.',
        footnote: 'Every contribution goes directly into hosting and development.',
        channels: [
          {
            id: 'buymeacoffee',
            name: 'Buy Me a Coffee',
            href: 'https://buymeacoffee.com/neuronection',
            description: 'One-time support — every coffee counts',
            highlight: true,
          },
          {
            id: 'github',
            name: 'GitHub Sponsors',
            href: 'https://github.com/neuronection',
            description: 'Recurring support for the organisation',
            icon: Globe,
          },
        ],
      }}
      copyright="© 2026 Neuronection"
    />
  </div>
)

export const SponsorWays = () => (
  <div style={{ maxWidth: 420, margin: '0 auto' }}>
    <SponsorCard
      title="Sponsor the Neuronection family"
      description="Open source that respects your data needs fuel. Fund the servers, the maintenance and what gets built next."
      footnote="neuronection.com · hosted and maintained by the community, for the community."
      channels={[
        {
          id: 'buymeacoffee',
          name: 'Buy Me a Coffee',
          href: 'https://buymeacoffee.com/neuronection',
          description: 'One-time support — every coffee counts',
          highlight: true,
        },
        {
          id: 'github',
          name: 'GitHub Sponsors',
          href: 'https://github.com/neuronection',
          description: 'Recurring support for the organisation',
          icon: Globe,
        },
      ]}
    />
  </div>
)

export const BuildingBlocks = () => (
  <div style={{ display: 'grid', gap: 24, maxWidth: 900, margin: '0 auto' }}>
    <AboutCard title="Our mission" description="Why this exists">
      <p style={{ margin: 0 }}>
        Deeply structured data instead of text dumps, AI that explains its reasoning, and
        you in control of your information.
      </p>
    </AboutCard>
    <AboutCard title="Links">
      <AboutLinkList
        links={[
          { href: 'https://neuronection.com', label: 'neuronection.com', icon: Globe },
          { href: 'https://github.com/neuronection', label: 'GitHub org' },
        ]}
      />
    </AboutCard>
    <AboutCard title="Privacy" description="Local control first">
      <AboutNote tone="info" title="Self-hosted">
        Your files never leave your machine unless you decide otherwise.
      </AboutNote>
    </AboutCard>
    <TechChips items={['pywebview', 'Tiptap', 'LangChain', 'Whisper STT', 'MCP tools']} />
    <FamilyBadge current="study" />
    <AboutCard title="Empty state">
      <TechChips items={[]} />
      <p style={{ margin: 0, fontSize: 13 }}>Tech chips render nothing when empty.</p>
    </AboutCard>
    <AboutCard title="Icons" description="Slot accepts any node">
      <ShieldCheck />
    </AboutCard>
  </div>
)
