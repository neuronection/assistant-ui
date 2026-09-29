#!/usr/bin/env node
// ADR-0024 catalog export: emits the backend-facing JSON data files
// (byte-identical copies live in the dev repo under
// templates/data/catalogs/ and in consuming repos; drift-checked by
// the dev repo's verify-wiring.sh).
//
// Usage: node scripts/export-catalogs.mjs [--out DIR]
// Requires Node >= 22.18 (native TS type stripping) — the sources are
// erasable-syntax-only. Bump TEMPLATE_VERSION when catalog data changes
// and copy the output into the dev repo in the same change.
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const TEMPLATE_VERSION = 1

const outDir = resolve(process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'catalogs-export')

const { COUNTRIES } = await import('../src/lib/countries.ts')
const { LANGUAGES } = await import('../src/lib/languages.ts')

mkdirSync(outDir, { recursive: true })
writeFileSync(
  resolve(outDir, 'countries.json'),
  `${JSON.stringify({ templateVersion: TEMPLATE_VERSION, countries: COUNTRIES }, null, 2)}\n`,
)
writeFileSync(
  resolve(outDir, 'languages.json'),
  `${JSON.stringify({ templateVersion: TEMPLATE_VERSION, languages: LANGUAGES }, null, 2)}\n`,
)
console.log(`exported ${COUNTRIES.length} countries + ${LANGUAGES.length} languages to ${outDir} (TEMPLATE_VERSION ${TEMPLATE_VERSION})`)
