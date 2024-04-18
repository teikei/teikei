import AuthManagement from 'feathers-authentication-management/src/client'

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

if (appContainerEl) {
  render(config, appContainerEl, makeMap)
}

if (searchContainerEl) {
  render(config, searchContainerEl, makeSearchWidget)
}
