import React from 'react'
import i18n from '../i18n'

const MapFooter = props => (
  <footer className="map-footer">

    <ul>
      <li className="map-footer-home">
        <a href="http://ernte-teilen.org/">
          ernte-teilen.org
        </a>
      </li>
      <li className="map-footer-terms">
        <a href="http://ernte-teilen.org/terms/">
          { i18n.t('nav.terms') }
        </a>
      </li>
      <li className="map-footer-imprint">
        <a href="http://ernte-teilen.org/contact/">
          { i18n.t('nav.imprint') }
        </a>
      </li>
    </ul>

    { i18n.t('nav.map_data') }

    <a href="https://www.mapbox.com/about/maps/">
      ©&nbsp;MapBox
    </a>
      &nbsp;|&nbsp;
    <a href="http://www.openstreetmap.org/about/">
      ©&nbsp;OpenStreetMap
    </a>

  </footer>
)

export default MapFooter
