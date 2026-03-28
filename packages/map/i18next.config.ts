import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['de-CH', 'de-DE', 'fr-CH'],
  extract: {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    output: 'src/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    defaultValue: '',
    keySeparator: false,
    nsSeparator: ':',
    contextSeparator: '_',
    pluralSeparator: '_',
    functions: ['t', '*.t'],
    transComponents: ['Trans'],
    preservePatterns: [
      'common:months.*',
      'common:places.details.accepts_new_members_*',
      'common:forms.labels.goals.*',
      'common:products.*',
      'common:productcategories.*',
      'common:badgescategories.*',
      'validations:*'
    ],
    sort: true,
    indentation: 2,
    primaryLanguage: 'de-DE',
    secondaryLanguages: ['de-CH', 'fr-CH']
  }
})
