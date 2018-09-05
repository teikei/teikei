import React from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import AuthManagement from 'feathers-authentication-management/lib/client'

import './styles/app.scss'
import { makeClient, makeMap, makeSearchWidget, render } from './App'
import makeConfiguration from './configuration'

const mapContainerEl = document.getElementById('teikei-app')
const searchContainerEl = document.getElementById('teikei-search')

const configDataset = {
  ...(mapContainerEl ? mapContainerEl.dataset : {}),
  ...(searchContainerEl ? searchContainerEl.dataset : {})
}

export const config = makeConfiguration(configDataset)
export const client = makeClient(config.apiBaseUrl)
export const authManagement = new AuthManagement(client)

if (mapContainerEl) {
  render(config, mapContainerEl, makeMap)
}

if (searchContainerEl) {
  render(config, searchContainerEl, makeSearchWidget)
}
