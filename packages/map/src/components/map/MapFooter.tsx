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
            {t('page.footer.title')}
          </a>
        </li>
        <li>
          <a
            href='http://ernte-teilen.org/datenschutz/'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('page.footer.privacy')}
          </a>
        </li>
        <li>
          <a
            href='http://ernte-teilen.org/impressum/'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('page.footer.imprint')}
          </a>
        </li>
      </ul>
      <ul className='map-footer__attribution'>
        <li>
          {t('page.footer.map_data')}
          <a
            href='https://www.mapbox.com/about/maps/'
            target='_blank'
            rel='noopener noreferrer'
          >
            ©&nbsp;{t('page.footer.mapbox')}
          </a>
        </li>
        <li>
          <a
            href='http://www.openstreetmap.org/about/'
            target='_blank'
            rel='noopener noreferrer'
          >
            ©&nbsp;{t('page.footer.openstreetmap')}
          </a>
        </li>
        <li>
          <strong>
            <a
              href='https://www.mapbox.com/map-feedback/'
              target='_blank'
              rel='noopener noreferrer'
            >
              {t('page.footer.improve_map')}
            </a>
          </strong>
        </li>
      </ul>
    </footer>
  )
}

export default MapFooter
