import prettierConfigStandard from 'prettier-config-standard' assert { type: 'json' }

export default {
  ...prettierConfigStandard,
  plugins: ['prettier-plugin-organize-imports']
}
