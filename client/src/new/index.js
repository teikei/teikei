import React from 'react';
import ReactDOM from 'react-dom';
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'
import App from './App'
import '../app'

ReactDOM.render(
  <App />,
  document.getElementById('main'),
);
