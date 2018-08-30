import React from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import AuthManagement from 'feathers-authentication-management/lib/client'

import './styles/site.scss'
import './styles/app.scss'
import { makeClient, startApp } from './App'
import makeConfiguration from './configuration'

const containerEl = document.getElementById('teikei-embed')

export const config = makeConfiguration(containerEl.dataset)
export const client = makeClient(config.apiBaseUrl)
export const authManagement = new AuthManagement(client)

startApp(config, containerEl)
