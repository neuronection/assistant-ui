import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = '@neuronection/assistant-ui'
const MARKER = '.assistant-ui-dev-link.json'

const HELP = `usage: node scripts/dev-link.mjs <link|unlink|status> <app-dir>

Temporarily points an app at the local assistant-ui checkout so library
changes are testable without publishing. Never commit the manifest edits:
run unlink (and reinstall) before committing anything in the app.

link    <app-dir>   wire the app to ../assistant-ui via package-manager native override
unlink  <app-dir>   restore the app manifest to its previous state
status  <app-dir>   show current link state`

function die(msg) {
  console.error(msg)
  process.exit(1)
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

function detectManager(appDir) {
  const pnpmRoot = findUp(appDir, (d) =>
    existsSync(join(d, 'pnpm-workspace.yaml')) || existsSync(join(d, 'pnpm-lock.yaml')),
  )
  if (pnpmRoot) return { manager: 'pnpm', root: pnpmRoot }
  const npmRoot = findUp(appDir, (d) => existsSync(join(d, 'package-lock.json')))
  if (npmRoot) return { manager: 'npm', root: npmRoot }
  return { manager: 'npm', root: appDir }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function toPosix(p) {
  return p.split('\\').join('/')
}

function linkPath(fromDir) {
  return toPosix(relative(fromDir, LIB_ROOT)) || '.'
}

function markerPath({ manager, root, appDir }) {
  return join(manager === 'pnpm' ? root : appDir, MARKER)
}

function readMarker(state) {
  const file = markerPath(state)
  return existsSync(file) ? readJson(file) : null
}

function doLink(appDir, state) {
  if (readMarker(state)) die(`dev-link: already linked (run status/unlink first)`)

  if (state.manager === 'pnpm') {
    const wsFile = join(state.root, 'pnpm-workspace.yaml')
    const created = !existsSync(wsFile)
    const previous = readOverrideFromWorkspace(wsFile)
    let text = created ? '' : readFileSync(wsFile, 'utf8')
    if (!text.endsWith('\n') && text !== '') text += '\n'
    if (!/^overrides:/m.test(text)) {
      text += `${text === '' ? '' : '\n'}overrides:\n`
    }
    text += `  "${PKG}": "link:${linkPath(state.root)}"\n`
    writeFileSync(wsFile, text)
    writeJson(markerPath(state), {
      manager: 'pnpm',
      file: wsFile,
      previous,
      hadKey: previous !== undefined,
      createdWorkspaceFile: created,
    })
    console.log(`dev-link: pnpm override added in ${wsFile}`)
    console.log(`dev-link: run install in ${state.root}, then develop:`)
  } else {
    const pkgFile = join(appDir, 'package.json')
    if (!existsSync(pkgFile)) die(`dev-link: ${pkgFile} not found`)
    const pkg = readJson(pkgFile)
    pkg.dependencies ??= {}
    const previous = pkg.dependencies[PKG]
    pkg.dependencies[PKG] = `file:${linkPath(appDir)}`
    writeJson(pkgFile, pkg)
    writeJson(markerPath(state), {
      manager: 'npm',
      file: pkgFile,
      previous,
      hadKey: previous !== undefined,
    })
    console.log(`dev-link: npm dependency swapped to file: in ${pkgFile}`)
    console.log(`dev-link: run install in ${appDir}, then develop:`)
  }
  console.log(`dev-link:   lib:  pnpm watch   (in ${LIB_ROOT})`)
  console.log(`dev-link:   app:  run the app dev server as usual`)
  console.log(`dev-link: DO NOT COMMIT manifest edits — unlink before committing`)
}

function readOverrideFromWorkspace(wsFile) {
  if (!existsSync(wsFile)) return undefined
  const lines = readFileSync(wsFile, 'utf8').split('\n')
  const idx = lines.findIndex((l) => new RegExp(`^\\s+['"]?${PKG.replace('/', '\\/')}['"]?:`).test(l))
  if (idx === -1) return undefined
  const value = lines[idx].split(':', 2)[1]?.trim() ?? ''
  return value.replace(/^['"]|['"]$/g, '')
}

function doUnlink(appDir, state) {
  const marker = readMarker(state)
  if (!marker) die(`dev-link: not linked`)

  if (marker.manager === 'pnpm') {
    if (marker.createdWorkspaceFile && marker.previous === undefined) {
      unlinkSync(marker.file)
    } else {
      const lines = readFileSync(marker.file, 'utf8').split('\n')
      const idx = lines.findIndex((l) =>
        new RegExp(`^\\s+['"]?${PKG.replace('/', '\\/')}['"]?:`).test(l),
      )
      if (idx !== -1) lines.splice(idx, 1)
      let text = lines.join('\n')
      text = text.replace(/\noverrides:\n(\s*\n)*(?=\S|$)/, '\n')
      writeFileSync(marker.file, text)
    }
  } else {
    const pkg = readJson(marker.file)
    pkg.dependencies ??= {}
    if (marker.hadKey) pkg.dependencies[PKG] = marker.previous
    else delete pkg.dependencies[PKG]
    writeJson(marker.file, pkg)
  }
  unlinkSync(markerPath(state))
  console.log(`dev-link: restored ${marker.file}`)
  console.log(
    `dev-link: re-run install in ${marker.manager === 'pnpm' ? state.root : appDir} to reset node_modules`,
  )
}

function doStatus(appDir, state) {
  const marker = readMarker(state)
  if (!marker) {
    console.log(`dev-link: not linked (${state.manager} app at ${appDir})`)
    return
  }
  console.log(`dev-link: linked via ${marker.manager} (marker ${markerPath(state)})`)
  console.log(`dev-link: manifest ${marker.file}`)
  console.log(`dev-link: previous specifier: ${marker.hadKey ? marker.previous : '<absent>'}`)
}

const [cmd, appArg] = process.argv.slice(2)
if (!cmd || !appArg || !['link', 'unlink', 'status'].includes(cmd)) die(HELP)
const appDir = resolve(appArg)
if (!existsSync(appDir)) die(`dev-link: ${appDir} does not exist`)
const state = { ...detectManager(appDir), appDir }

if (cmd === 'link') doLink(appDir, state)
else if (cmd === 'unlink') doUnlink(appDir, state)
else doStatus(appDir, state)
