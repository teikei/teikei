import { type Config } from 'prettier'

export default {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'none',
  plugins: ['prettier-plugin-organize-imports']
} satisfies Config
