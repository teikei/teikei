import Polyglot from 'node-polyglot'
import translations from './translations.json'

const i18n = new Polyglot({
  phrases: translations[Teikei.config.locale],
})

export default i18n
