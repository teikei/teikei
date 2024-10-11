// @ts-ignore
import Polyglot from 'node-polyglot'
import translations from './translations.json'

// TODO enable user config from client page (use attribute instead of global?)
// const i18n = new Polyglot({
//   phrases: translations[Teikei.config.locale]
// })

const i18n = new Polyglot({
  phrases: translations.de
})

export default i18n
