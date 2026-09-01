#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const modulesDir = join(root, 'src', 'components')
const docsDir = join(root, 'docs', 'components')
const playgroundDir = join(root, 'playground')

const pascal = (name) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

function exportNames(moduleName) {
  const names = new Set([pascal(moduleName)])
  const indexFile = join(modulesDir, moduleName, 'index.ts')
  if (!existsSync(indexFile)) return names
  const source = readFileSync(indexFile, 'utf8')
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const entry of match[1].split(',')) {
      const name = entry
        .trim()
        .replace(/^type\s+/, '')
        .replace(/\s+as\s+.*$/, '')
      if (/^[A-Z]/.test(name)) names.add(name)
    }
  }
  for (const match of source.matchAll(
    /export\s+(?:const|function|interface|type|class)\s+([A-Za-z0-9_]+)/g,
  )) {
    if (/^[A-Z]/.test(match[1])) names.add(match[1])
  }
  return names
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

const readme = readFileSync(join(root, 'README.md'), 'utf8')
const accessibility = readIfExists(join(root, 'docs', 'accessibility.md'))
const stories = readdirSync(playgroundDir)
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => readFileSync(join(playgroundDir, file), 'utf8'))
  .join('\n')

const modules = readdirSync(modulesDir).filter((name) =>
  statSync(join(modulesDir, name)).isDirectory(),
)

const failures = []
for (const moduleName of modules.sort()) {
  const problems = []
  if (!existsSync(join(docsDir, `${moduleName}.md`))) {
    problems.push('no docs/components page')
  }
  if (!new RegExp(`\\b${moduleName}\\b`).test(readme)) {
    problems.push('no README row')
  }
  const names = exportNames(moduleName)
  const matcher = (text) => [...names].some((name) => new RegExp(`\\b${name}\\b`).test(text))
  if (!matcher(stories)) {
    problems.push('no playground story')
  }
  if (!matcher(accessibility)) {
    problems.push('no accessibility.md row')
  }
  if (problems.length > 0) {
    failures.push({ moduleName, problems })
  }
}

if (failures.length > 0) {
  console.error(`docs coverage: ${modules.length - failures.length}/${modules.length} modules complete`)
  for (const { moduleName, problems } of failures) {
    console.error(`  ${moduleName}: ${problems.join(', ')}`)
  }
  process.exit(1)
}
console.log(`docs coverage: ${modules.length}/${modules.length} modules complete`)
