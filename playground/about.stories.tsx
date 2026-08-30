import { Globe, ShieldCheck } from 'lucide-react'
import { AboutPanel } from '../src/components/about/AboutPanel'
import { AboutCard } from '../src/components/about/AboutCard'
import { AboutLinkList } from '../src/components/about/AboutLinkList'
import { AboutNote } from '../src/components/about/AboutNote'
import { FamilyBadge } from '../src/components/about/FamilyBadge'
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
      copyright="© 2026 Neuronection"
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
