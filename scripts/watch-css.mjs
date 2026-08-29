import { spawn } from 'node:child_process'
import { existsSync, watch } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import postcss from 'postcss'
import { unwrapCss } from './unwrap-layers.mjs'

const OUT = 'dist/styles.css'

async function postprocess() {
  if (!existsSync(OUT)) return
  const css = await readFile(OUT, 'utf8')
  const result = await postcss([unwrapCss]).process(css, { from: OUT })
  await writeFile(OUT, result.css)
  console.log(`watch-css: unwrapped layers in ${OUT}`)
}

await mkdir('dist', { recursive: true })

const child = spawn(
  'pnpm',
  ['exec', 'tailwindcss', '-i', 'src/tokens/tokens.css', '-o', OUT, '--watch'],
  { stdio: 'inherit' },
)

let timer
function pollExists() {
  if (existsSync(OUT)) {
    watch(OUT, () => {
      clearTimeout(timer)
      timer = setTimeout(postprocess, 120)
    })
    postprocess()
  } else {
    setTimeout(pollExists, 500)
  }
}
pollExists()

child.on('exit', (code) => process.exit(code ?? 0))
