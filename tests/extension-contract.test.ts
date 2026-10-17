import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildVocabModule } from '../scripts/sync-extension-vocab.mjs'
import {
  EXTENSION_CAPABILITIES,
  EXTENSION_CATEGORIES,
  EXTENSION_CONSENT_DISCLOSURES,
  EXTENSION_ORIGIN_CLASSES,
  EXTENSION_REF_STRATEGIES,
  EXTENSION_RISK_CLASSES,
  EXTENSION_STATUS_STATES,
  EXTENSION_TIERS,
} from '../src/contracts'
import { parseIntegrationConfigSchema } from '../src/contracts/integration-views'
import type { IntegrationConfigSchema } from '../src/contracts/integration-views'

const charter = JSON.parse(
  readFileSync(join(__dirname, '..', 'contracts', 'extension-charter.json'), 'utf8'),
) as Record<string, unknown>

const GENERATED = join(__dirname, '..', 'src', 'contracts', 'extension-charter.vocab.ts')

describe('extension-charter vendored contract (ADR-0040 / D11)', () => {
  it('the vendored charter is the canonical byte-for-byte (when the dev checkout is present)', () => {
    const canonicalPath = join(
      __dirname,
      '..',
      '..',
      'dev',
      'contracts',
      'extension-charter.json',
    )
    if (!existsSync(canonicalPath)) {
      console.warn('dev checkout absent — the canonical byte-identity wall is dev verify-wiring’s ext probe')
      return
    }
    const canonical = readFileSync(canonicalPath, 'utf8')
    const vendored = readFileSync(
      join(__dirname, '..', 'contracts', 'extension-charter.json'),
      'utf8',
    )
    expect(vendored).toBe(canonical)
  })

  it('the generated vocabulary module regenerates byte-identical from the charter', () => {
    const onDisk = readFileSync(GENERATED, 'utf8')
    expect(onDisk).toBe(buildVocabModule(charter))
  })

  it('every closed vocabulary matches the charter section it comes from', () => {
    const c = charter as {
      originClasses: { vocabulary: string[] }
      categories: { vocabulary: string[] }
      status: { states: string[] }
      tiers: { ladder: Array<{ id: string }> }
      capabilities: Array<{ id: string }>
      riskClasses: { vocabulary: string[] }
      sources: { refStrategies: string[] }
    }
    expect(EXTENSION_ORIGIN_CLASSES).toEqual(c.originClasses.vocabulary)
    expect(EXTENSION_CATEGORIES).toEqual(c.categories.vocabulary)
    expect(EXTENSION_STATUS_STATES).toEqual(c.status.states)
    expect(EXTENSION_TIERS).toEqual(c.tiers.ladder.map((t) => t.id))
    expect(EXTENSION_CAPABILITIES).toEqual(c.capabilities.map((x) => x.id))
    expect(EXTENSION_RISK_CLASSES).toEqual(c.riskClasses.vocabulary)
    expect(EXTENSION_REF_STRATEGIES).toEqual(c.sources.refStrategies)
  })

  it('the verbatim consent disclosures travel from the charter (D22 law text as data)', () => {
    const disclosures = charter.consent as Record<string, string>
    expect(EXTENSION_CONSENT_DISCLOSURES.t3Perimeter).toBe(
      disclosures.t3PerimeterDisclosure,
    )
    expect(EXTENSION_CONSENT_DISCLOSURES.t2Sandbox).toBe(
      disclosures.t2SandboxDisclosure,
    )
    expect(EXTENSION_CONSENT_DISCLOSURES.t0Declarative).toBe(
      disclosures.t0DeclarativeDisclosure,
    )
  })
})

describe('parseIntegrationConfigSchema', () => {
  it('maps the charter JSON-schema subset to fields with required + x-secret', () => {
    const schema: IntegrationConfigSchema = {
      type: 'object',
      properties: {
        query: { type: 'string', title: 'Query', minLength: 1, pattern: '^[a-z]+$' },
        limit: { type: 'number', title: 'Limit', default: 10, minimum: 1, maximum: 100 },
        verbose: { type: 'boolean', description: 'Extra output' },
        tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
        kind: { type: 'string', enum: ['rss', 'site'] },
        token: { type: 'string', 'x-secret': true },
      },
      required: ['query', 'token'],
    }
    const fields = parseIntegrationConfigSchema(schema)
    expect(fields.map((f) => f.name)).toEqual([
      'query',
      'limit',
      'verbose',
      'tags',
      'kind',
      'token',
    ])
    const query = fields.find((f) => f.name === 'query')
    expect(query?.required).toBe(true)
    expect(query?.pattern).toBe('^[a-z]+$')
    const limit = fields.find((f) => f.name === 'limit')
    expect(limit?.defaultValue).toBe(10)
    expect(limit?.maximum).toBe(100)
    const tags = fields.find((f) => f.name === 'tags')
    expect(tags?.itemType).toBe('string')
    const token = fields.find((f) => f.name === 'token')
    expect(token?.secret).toBe(true)
    expect(token?.required).toBe(true)
  })
})
