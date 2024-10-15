import { useTranslation } from 'react-i18next'

const MapFooter = () => {
  const { t } = useTranslation()
  return (
    <footer className='map-footer'>
      <ul className='map-footer__navigation'>
        <li>
          <a
            href='http://ernte-teilen.org/'
            target='_blank'
            rel='noopener noreferrer'
          >
            ernte-teilen.org
          </a>
        </li>
        <li>
          <a
            href='http://ernte-teilen.org/datenschutz/'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('nav.privacy')}
          </a>
        </li>
        <li>
          <a
            href='http://ernte-teilen.org/impressum/'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('nav.imprint')}
          </a>
        </li>
      </ul>
      <ul className='map-footer__attribution'>
        <li>
          {t('nav.map_data')}
          <a
            href='https://www.mapbox.com/about/maps/'
            target='_blank'
            rel='noopener noreferrer'
          >
            ©&nbsp;MapBox
          </a>
        </li>
        <li>
          <a
            href='http://www.openstreetmap.org/about/'
            target='_blank'
            rel='noopener noreferrer'
          >
            ©&nbsp;OpenStreetMap
          </a>
        </li>
        <li>
          <strong>
            <a
              href='https://www.mapbox.com/map-feedback/'
              target='_blank'
              rel='noopener noreferrer'
            >
              Improve this map
            </a>
          </strong>
        </li>
      </ul>
    </footer>
  )
}

export default MapFooter
