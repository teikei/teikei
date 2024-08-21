import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

const defaultLocale = import.meta.env.DEV ? 'dev' : 'de-DE'

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../locales/${language}/${namespace}.json`)
    })
  )
  .use(initReactI18next)
  .init({
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    debug: true,
    interpolation: {
      escapeValue: false
    },
    keySeparator: false,
    ns: ['common', 'map', 'search'],
    defaultNS: ['common']
  })

export default i18n
