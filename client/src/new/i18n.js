import Polyglot from 'node-polyglot'
import translations from './translations.json'

const initializeI18n = locale => new Polyglot({
  phrases: translations[locale],
})

export default initializeI18n
