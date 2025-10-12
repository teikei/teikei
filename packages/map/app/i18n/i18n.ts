import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import configuration from '~/configuration'

const { displayLocale } = configuration
const isBrowser = typeof window !== 'undefined'

let displayLocaleWithOverride = displayLocale

if (isBrowser) {
  const search =
    window.location.search || window.location.hash.split('?')[1] || ''
  const queryString = new URLSearchParams(search)
  if (queryString.has('override_locale')) {
    const overrideLocale = queryString.get('override_locale')
    if (overrideLocale) {
      // write to local storage
      localStorage.setItem('displayLocale', overrideLocale)
    }
  }

  displayLocaleWithOverride =
    localStorage.getItem('displayLocale') || displayLocale
}

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../locales/${language}/${namespace}.json`)
    })
  )
  .use(initReactI18next)
  .init({
    lng: displayLocaleWithOverride,
    debug: false,
    interpolation: {
      escapeValue: false
    },
    keySeparator: false,
    ns: ['common', 'validations'],
    defaultNS: ['common']
  })

export default i18n
