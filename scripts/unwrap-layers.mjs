import postcss from 'postcss'

export const unwrapCss = {
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

const FILE = 'dist/styles.css'

if (process.argv[1] && (process.argv[1].endsWith('unwrap-layers.mjs'))) {
  const { readFile, writeFile } = await import('node:fs/promises')
  const css = await readFile(FILE, 'utf8')
  const result = await postcss([unwrapCss]).process(css, { from: FILE })
  await writeFile(FILE, result.css)
  if (result.css.includes('@layer')) {
    console.error('unwrap-layers: @layer rules remain in output')
    process.exit(1)
  }
  console.log(`unwrap-layers: wrote ${FILE} (${result.css.length} bytes, layers stripped)`)
}
