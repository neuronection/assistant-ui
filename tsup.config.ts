import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tokens: 'src/tokens/tokens.ts',
    badge: 'src/components/badge/index.ts',
    button: 'src/components/button/index.ts',
    card: 'src/components/card/index.ts',
    'confirmation-modal': 'src/components/confirmation-modal/index.ts',
    'empty-state': 'src/components/empty-state/index.ts',
    input: 'src/components/input/index.ts',
    modal: 'src/components/modal/index.ts',
    popover: 'src/components/popover/index.ts',
    portal: 'src/components/portal/index.ts',
    spinner: 'src/components/spinner/index.ts',
    'theme-scope': 'src/components/theme-scope/index.ts',
    tooltip: 'src/components/tooltip/index.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: 'smallest',
})
