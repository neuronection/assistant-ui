import { cpSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'katex', 'dist', 'fonts')
const target = join(root, 'dist', 'fonts')

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true })
}
if (existsSync(source)) {
  cpSync(source, target, { recursive: true })
  console.log('copy-katex-fonts: dist/fonts updated')
} else {
  console.log('copy-katex-fonts: katex not installed, skipped')
}
