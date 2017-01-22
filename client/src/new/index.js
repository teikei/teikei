import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

require('../app')
require('leaflet')
require('leaflet/dist/leaflet.css')
require('leaflet.markercluster')
require('leaflet.markercluster/dist/MarkerCluster.css')


ReactDOM.render(
  <App />,
  document.getElementById('main'),
);
