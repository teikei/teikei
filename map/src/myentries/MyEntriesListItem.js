import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import PreviewTile from '../common/PreviewTile'
import { getEditPath, getDeletePath } from '../AppRouter'
import { getLatitude, getLongitude } from '../common/geoJsonUtils'

const MyEntriesListItem = ({ feature }) => {
  const {
    properties: { name, city, type }
  } = feature
  return (
    <div>
      <div className="entries-list-item">
        <div className="entries-list-name">
          <h2>{name}</h2>
          {city}
          <ul className="entries-list-controls">
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

MyEntriesListItem.propTypes = {
  feature: PropTypes.shape({
    name: PropTypes.string,
    city: PropTypes.string,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    type: PropTypes.string
  }).isRequired
}

export default MyEntriesListItem
