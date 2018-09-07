import React from 'react'
import Map from '../Map'

import './styles.scss'
import ListView from '../../components/ListView'

const MapScreen = props => (
  <div className="tk-map-screen__container">
    <div className="tk-map-screen__listcontainer">
      <ListView/>
    </div>
    <div className="tk-map-screen__mapcontainer">
      <Map/>
    </div>
  </div>
)

export default MapScreen


