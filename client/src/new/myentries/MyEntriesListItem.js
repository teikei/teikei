import React from 'react'
import { Link } from 'react-router'
import PreviewTile from '../common/PreviewTile'
import { getEditPath, getDeletePath } from '../AppRouter'

const MyEntriesListItem = ({ place }) => (
  <div>
    <div className="entrylist-item">
      <div className="entrylist-name">
        <h2>{place.name}</h2>
        <em>{place.city}</em>
        <ul className="entrylist-controls">
          <li>
            <Link to={() => getEditPath(place)}>Bearbeiten</Link>
          </li>
          <li>
            <Link to={() => getDeletePath(place)}>Löschen</Link>
          </li>
        </ul>
      </div>
      <PreviewTile
        latitude={place.latitude}
        longitude={place.longitude}
        markerIcon={place.type}
      />
    </div>
  </div>
)

MyEntriesListItem.propTypes = {
  place: React.PropTypes.object.isRequired,
}

export default MyEntriesListItem
