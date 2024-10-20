import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import './styles/app.scss'

import { makeSearchWidget, makeMap, render } from './App'
import { appContainerEl, searchContainerEl } from './configuration'

import './i18n/i18n'

if (appContainerEl) {
  render(appContainerEl, makeMap)
}

if (searchContainerEl) {
  render(searchContainerEl, makeSearchWidget)
}
