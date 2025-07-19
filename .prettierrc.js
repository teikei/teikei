export default {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'none',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^@/.*/(.*)$', '^@/components/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderSideEffects: false
}
