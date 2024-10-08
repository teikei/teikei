import { Link } from 'react-router-dom'
import PreviewTile from '../../components/PreviewTile/index'
import { getEditPath, getDeletePath } from '../../AppRouter'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'

interface FeatureProperties {
  name: string
  city: string
  type: string
}

interface Feature {
  properties: FeatureProperties
}

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
              <Link to={() => getEditPath(feature)}>Bearbeiten</Link>
            </li>
            <li>
              <Link to={() => getDeletePath(feature)}>Löschen</Link>
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
