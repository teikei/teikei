import { Link } from 'react-router-dom'

import PreviewTile from '../base/PreviewTile'
import { getEditPath, getDeletePath } from '../../common/routeUtils'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { Feature } from '../../types/types'

interface MyEntriesListItemProps {
  feature: Feature
}

const MyEntriesListItem = ({ feature }: MyEntriesListItemProps) => {
  const {
    properties: { name, city, type }
  } = feature
  return (
    <div>
      <div className='entries-list-item'>
        <div className='entries-list-name'>
          <h2>{name}</h2>
          {city}
          <ul className='entries-list-controls'>
            <li>
              <Link to={getEditPath(feature)}>Bearbeiten</Link>
            </li>
            <li>
              <Link to={getDeletePath(feature)}>Löschen</Link>
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
