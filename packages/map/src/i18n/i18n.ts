import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

import configuration from '../configuration'

const { displayLocale } = configuration

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../locales/${language}/${namespace}.json`)
    })
  )
  .use(initReactI18next)
  .init({
    lng: displayLocale,
    debug: true,
    interpolation: {
      escapeValue: false
    },
    keySeparator: false,
    ns: ['common', 'map', 'search'],
    defaultNS: ['common']
  })

export default i18n
