import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { getDeletePath, getEditPath } from '../../common/routeUtils'
import { Feature } from '../../types/types'
import PreviewTile from '../base/PreviewTile'

interface MyEntriesListItemProps {
  feature: Feature
}

const MyEntriesListItem = ({ feature }: MyEntriesListItemProps) => {
  const {
    properties: { name, city, type }
  } = feature

  const { t } = useTranslation()
  return (
    <div>
      <div className='entries-list-item'>
        <div className='entries-list-name'>
          <h2>{name}</h2>
          {city}
          <ul className='entries-list-controls'>
            <li>
              <Link to={getEditPath(feature)}>{t('myentries.edit')}</Link>
            </li>
            <li>
              <Link to={getDeletePath(feature)}>{t('myentries.delete')}</Link>
            </li>
          </ul>
        </div>
        <PreviewTile
          latitude={getLatitude(feature)}
          longitude={getLongitude(feature)}
          markerIcon={type}
        />
      </div>
    </div>
  )
}

export default MyEntriesListItem
