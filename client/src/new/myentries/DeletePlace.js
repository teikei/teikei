import React from 'react'
import { Link } from 'react-router'
import { MY_ENTRIES } from '../AppRouter'
import PreviewTile from '../common/PreviewTile'

const DeletePlace = ({ place, onDeleteClick }) => (
  <div className="container">
    <div className="entries-list">
      <article>
        <h1 className="title">Eintrag löschen</h1>
        <div className="row delete-entry-confirmation">
          <p>Möchtest Du diesen Eintrag wirklich löschen?</p>
        </div>
        <div className="entries-list-item row">
          <div className="entries-list-name seven columns">
            <h3>{place ? place.name : ''}</h3>
            <em>{place ? place.city : ''}</em>
          </div>
          <PreviewTile
            latitude={place ? Number(place.latitude) : 0}
            longitude={place ? Number(place.longitude) : 0}
            markerIcon={place ? place.type : ''}
          />
        </div>
        <div className="row">
          <div id="delete-entry-buttons">
            <button className="delete-entry button" onClick={() => onDeleteClick(place.id)}>Löschen</button>
            <Link to={MY_ENTRIES}>Abbrechen</Link>
          </div>
        </div>
      </article>
    </div>
  </div>
)

DeletePlace.propTypes = {
  place: React.PropTypes.object,
  onDeleteClick: React.PropTypes.func.isRequired,
}


export default DeletePlace
