import { readdir, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'

const LIBRARY_COMPONENTS = [
  'Badge',
  'Button',
  'Card',
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'CardContent',
  'CardFooter',
  'ConfirmationModal',
  'EmptyState',
  'Input',
  'Modal',
  'ModalContent',
  'ModalHeader',
  'ModalTitle',
  'ModalDescription',
  'ModalFooter',
  'Popover',
  'PopoverContent',
  'Portal',
  'Spinner',
  'ThemeScope',
  'Tooltip',
  'TooltipContent',
  'InfoTooltip',
]

const usage = `usage: node scripts/audit-usage.mjs <app-src-dir> [--report]

Scans an app's source tree for local component files whose names shadow
library exports (ui/Button.tsx etc.). Exits 1 when drift is found unless
--report is passed (print only).`

const args = process.argv.slice(2)
const reportOnly = args.includes('--report')
const target = args.find((a) => !a.startsWith('--'))
if (!target) {
  console.error(usage)
  process.exit(2)
}

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, files)
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full)
  }
  return files
}

const files = await walk(target)
const findings = []
for (const file of files) {
  const name = basename(file).replace(/\.(tsx|ts)$/, '')
  if (LIBRARY_COMPONENTS.includes(name)) {
    const source = await readFile(file, 'utf8')
    if (/from ['"]@neuronection\/assistant-ui/.test(source)) continue
    findings.push(file)
  }
}

if (findings.length === 0) {
  console.log(`audit-usage: clean (${files.length} files scanned in ${target})`)
  process.exit(0)
}

console.error(`audit-usage: local copies shadowing library components (same-commit delete rule):`)
for (const file of findings) console.error(`  ${file}`)
if (!reportOnly) process.exit(1)
