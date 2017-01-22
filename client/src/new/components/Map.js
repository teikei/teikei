import React from 'react'
import {render} from 'react-dom'
import conf from '../../configuration'
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'

const position = [51.505, -0.09];

const TeikeiMap = props => (
  <div className="map-container">
    <Map center={position} zoom={13} className="map">
      <TileLayer
        url={`//{s}.tiles.mapbox.com/v3/${conf.apiKey}/{z}/{x}/{y}.png`}
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </Map>
  </div>
);

export default TeikeiMap
