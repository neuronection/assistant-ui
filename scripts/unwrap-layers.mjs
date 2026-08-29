import { readFile, writeFile } from 'node:fs/promises'
import postcss from 'postcss'

const FILE = 'dist/styles.css'

const unwrapper = {
  postcssPlugin: 'unwrap-layers',
  AtRule: {
    layer(atRule) {
      if (atRule.nodes && atRule.nodes.length > 0) {
        atRule.replaceWith(...atRule.nodes)
      } else {
        atRule.remove()
      }
    },
  },
}

const css = await readFile(FILE, 'utf8')
const result = await postcss([unwrapper]).process(css, { from: FILE })
await writeFile(FILE, result.css)

if (result.css.includes('@layer')) {
  console.error('unwrap-layers: @layer rules remain in output')
  process.exit(1)
}
console.log(`unwrap-layers: wrote ${FILE} (${result.css.length} bytes, layers stripped)`)
