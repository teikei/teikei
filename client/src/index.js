import React from 'react'
import ReactDOM from 'react-dom'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import '../styles/app.scss'
import App from './App'

// TODO add this to global context (window)
// to call it from the html page and initialize config
// with the passed parameters
//
// export default (config) => {
//   ReactDOM.render(
//     <App />,
//     document.getElementById('main'),
//   )
// }

ReactDOM.render(<App />, document.getElementById('teikei-embed'))
