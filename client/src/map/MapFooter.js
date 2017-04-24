import React from 'react'
import i18n from '../i18n'

const MapFooter = () => (
  <footer className="map-footer">

    <ul>
      <li className="map-footer-home">
        <a href="http://ernte-teilen.org/" target="_blank" rel="noopener noreferrer">
          ernte-teilen.org
        </a>
      </li>
      <li className="map-footer-terms">
        <a href="http://ernte-teilen.org/terms/" target="_blank" rel="noopener noreferrer">
          { i18n.t('nav.terms') }
        </a>
      </li>
      <li className="map-footer-imprint">
        <a href="http://ernte-teilen.org/contact/" target="_blank" rel="noopener noreferrer">
          { i18n.t('nav.imprint') }
        </a>
      </li>
    </ul>

    { i18n.t('nav.map_data') }

    <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">
      ©&nbsp;MapBox
    </a>
      &nbsp;|&nbsp;
    <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener noreferrer">
      ©&nbsp;OpenStreetMap
    </a>

  </footer>
)

export default MapFooter
