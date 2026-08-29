import { spawn } from 'node:child_process'
import { watch } from 'node:fs'

const IGNORE = ['.css', '.map', '.d.ts']
let building = false
let pending = false

function build() {
  if (building) {
    pending = true
    return
  }
  building = true
  console.log('watch-ts: rebuilding...')
  const child = spawn('pnpm', ['exec', 'tsup'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, AS_UI_WATCH: '1' },
  })
  child.on('exit', (code) => {
    building = false
    if (code === 0) console.log('watch-ts: dist updated')
    else console.error(`watch-ts: build failed (exit ${code}), still watching`)
    if (pending) {
      pending = false
      build()
    }
  })
}

let timer
watch('src', { recursive: true }, (_event, filename) => {
  if (typeof filename === 'string' && IGNORE.some((ext) => filename.endsWith(ext))) return
  clearTimeout(timer)
  timer = setTimeout(build, 150)
})

console.log('watch-ts: watching src/ (ESM-only fast rebuilds; run pnpm build for d.ts)')
build()
