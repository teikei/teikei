// @ts-ignore
import AuthManagement from 'feathers-authentication-management/src/client'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import './styles/app.scss'

import { makeClient, makeSearchWidget, makeMap, render } from './App'
import makeConfiguration from './configuration'

const appContainerEl = document.getElementById('teikei-app')
const searchContainerEl = document.getElementById('teikei-search')

const configDataset = {
  ...(appContainerEl ? appContainerEl.dataset : {}),
  ...(searchContainerEl ? searchContainerEl.dataset : {})
}

export const config = makeConfiguration(configDataset)
export const client = makeClient(config.apiBaseUrl)
export const authManagement = new AuthManagement(client)

const defaultLocale =
  import.meta.env.NODE_ENV === 'development' ? 'dev' : 'de-DE'

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .use(initReactI18next)
  .init({
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false
    },
    ns: ['common', 'map', 'search'],
    defaultNS: ['common']
  })

if (appContainerEl) {
  render(config, appContainerEl, makeMap)
}

if (searchContainerEl) {
  render(config, searchContainerEl, makeSearchWidget)
}
