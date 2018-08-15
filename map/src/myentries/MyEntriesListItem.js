import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import PreviewTile from '../common/PreviewTile'
import { getEditPath, getDeletePath } from '../AppRouter'

const MyEntriesListItem = ({ place: feature }) => (
  <div>
    <div className="entries-list-item">
      <div className="entries-list-name">
        <h2>{feature.name}</h2>
        {feature.city}
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
        latitude={Number(feature.latitude)}
        longitude={Number(feature.longitude)}
        markerIcon={feature.type}
      />
    </div>
  </div>
)

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
