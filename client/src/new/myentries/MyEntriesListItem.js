import React from 'react'
import PreviewTile from '../common/PreviewTile'

const MyEntriesListItem = ({ place, onEditClick, onDeleteClick }) => (
  <div>
    <div className="entrylist-item">
      <div className="entrylist-name">
        <h2>{place.name}</h2>
        <em>{place.city}</em>
        <ul className="entrylist-controls">
          <li>
            <a href="#" className="edit-entry" onClick={() => onEditClick(place)}>Bearbeiten</a>
          </li>
          <li>
            <a href="#" className="delete-entry" onClick={() => onDeleteClick(place)}>Löschen</a>
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
  onEditClick: React.PropTypes.func.isRequired,
  onDeleteClick: React.PropTypes.func.isRequired,
}

export default MyEntriesListItem
