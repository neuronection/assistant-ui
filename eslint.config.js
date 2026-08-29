import js from '@eslint/js'
import globals from 'globals'
import hooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.ladle', 'coverage', 'build'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs', 'vite.config.mjs', '.ladle/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': hooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='use']",
          message: 'React 19-only API `use()` is banned: library supports React 18 (ADR-003).',
        },
        {
          selector: "CallExpression[callee.name='useActionState']",
          message: 'React 19-only API `useActionState()` is banned: library supports React 18 (ADR-003).',
        },
        {
          selector: "CallExpression[callee.name='useOptimistic']",
          message: 'React 19-only API `useOptimistic()` is banned: library supports React 18 (ADR-003).',
        },
      ],
    },
  },
)
