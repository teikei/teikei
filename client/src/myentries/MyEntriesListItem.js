import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import PreviewTile from '../common/PreviewTile'
import { getEditPath, getDeletePath } from '../AppRouter'

const MyEntriesListItem = ({ place }) => (
  <div>
    <div className="entries-list-item">
      <div className="entries-list-name">
        <h2>{place.name}</h2>
        {place.city}
        <ul className="entries-list-controls">
          <li>
            <Link to={() => getEditPath(place)}>Bearbeiten</Link>
          </li>
          <li>
            <Link to={() => getDeletePath(place)}>Löschen</Link>
          </li>
        </ul>
      </div>
      <PreviewTile
        latitude={Number(place.latitude)}
        longitude={Number(place.longitude)}
        markerIcon={place.type}
      />
    </div>
  </div>
)

MyEntriesListItem.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string,
    city: PropTypes.string,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    type: PropTypes.string
  }).isRequired
}

export default MyEntriesListItem
