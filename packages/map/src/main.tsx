import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import './styles/app.scss'

import { makeSearchWidget, makeMap, render } from './App'
import configuration, {
  appContainerEl,
  searchContainerEl
} from './configuration'

if (appContainerEl) {
  render(configuration, appContainerEl, makeMap)
}

if (searchContainerEl) {
  render(configuration, searchContainerEl, makeSearchWidget)
}
