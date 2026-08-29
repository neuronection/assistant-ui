import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = '@neuronection/assistant-ui'

const HELP = `usage: node scripts/verify-in-app.mjs <app-dir> [--test "<cmd>"] [--keep]

Builds and packs the library, installs the tarball into the app, runs the
app's test suite against it, then restores the app manifest + lockfile.
This is the reliable way to run an app's vitest against local library
changes (dev-link symlinks break app tests under pnpm: dual React copies).

  <app-dir>   app frontend dir (e.g. ../study-assistant/frontend)
  --test      override the test command (run from the app dir for npm apps,
              from the workspace root for pnpm apps)
  --keep      leave the tarball installed (skips manifest restore)`

const args = process.argv.slice(2)
const keep = args.includes('--keep')
const testIdx = args.indexOf('--test')
const testOverride = testIdx !== -1 ? args[testIdx + 1] : undefined
const appDir = args.find(
  (a, i) =>
    a !== '--test' && a !== '--keep' && (testIdx === -1 || i !== testIdx + 1),
)

if (!appDir) {
  console.error(HELP)
  process.exit(2)
}

function die(msg) {
  console.error(`verify-in-app: ${msg}`)
  process.exit(1)
}

function run(cmd, cwd, extraEnv = {}) {
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true', ...extraEnv },
  })
}

function findUp(start, predicate) {
  let dir = resolve(start)
  while (true) {
    if (predicate(dir)) return dir
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

const APP = resolve(appDir)
if (!existsSync(join(APP, 'package.json'))) {
  die(`no package.json in ${APP}`)
}

const pnpmRoot = findUp(APP, (d) => existsSync(join(d, 'pnpm-workspace.yaml')))
const mode = pnpmRoot ? 'pnpm' : 'npm'
const appName = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf8')).name

console.log(`verify-in-app: ${PKG} -> ${APP} (${mode}${pnpmRoot ? ` workspace, filter ${appName}` : ''})`)

console.log('verify-in-app: building + packing library')
run('pnpm build', LIB_ROOT)
execSync('pnpm pack', { cwd: LIB_ROOT, stdio: 'pipe' })
const tarball = readdirSync(LIB_ROOT).find((f) => /^neuronection-assistant-ui-.*\.tgz$/.test(f))
if (!tarball) {
  die('pack produced no tarball')
}
const tarballPath = join(LIB_ROOT, tarball)

const savedFiles = [
  join(APP, 'package.json'),
  ...(mode === 'pnpm'
    ? [join(pnpmRoot, 'pnpm-lock.yaml'), join(pnpmRoot, 'pnpm-workspace.yaml')]
    : [join(APP, 'package-lock.json')]),
]
const saved = new Map()
for (const file of savedFiles) {
  if (existsSync(file)) {
    saved.set(file, readFileSync(file, 'utf8'))
  }
}

function restore() {
  for (const [file, content] of saved) {
    writeFileSync(file, content)
  }
  rmSync(tarballPath, { force: true })
  if (mode === 'pnpm') {
    run('pnpm install', pnpmRoot)
  } else {
    run('npm install', APP)
  }
}

try {
  console.log('verify-in-app: installing tarball')
  if (mode === 'pnpm') {
    try {
      run(`pnpm --filter ${appName} remove ${PKG}`, pnpmRoot)
    } catch {
      void 0
    }
    run(`pnpm --filter ${appName} add file:${tarballPath}`, pnpmRoot)
  } else {
    run(`npm install --no-save ${tarballPath}`, APP)
  }

  console.log('verify-in-app: running app tests')
  const testCmd =
    testOverride ?? (mode === 'pnpm' ? `pnpm --filter ${appName} test` : 'npm test')
  run(testCmd, mode === 'pnpm' ? pnpmRoot : APP)

  console.log('verify-in-app: OK — app suite green against the local tarball')
} finally {
  if (keep) {
    console.log(`verify-in-app: --keep — tarball ${tarball} left installed (manifest dirty)`)
  } else {
    console.log('verify-in-app: restoring app manifest + lockfile')
    restore()
  }
}
