import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Link } from 'react-router'
import { deleteFeature } from '../EntryForm/duck'
import PreviewTile from '../../components/PreviewTile/index'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { MY_ENTRIES } from '../../AppRouter'
import Loading from '../../components/Loading/index'

const DeletePlace = ({ feature, deletePlace }) => {
  if (feature) {
    const {
      properties: { name, city, type }
    } = feature
    return (
      <div className="container">
        <div className="entries-list">
          <article>
            <h1 className="title">Eintrag löschen</h1>
            <div className="row delete-entry-confirmation">
              <p>Möchtest Du diesen Eintrag wirklich löschen?</p>
            </div>
            <div className="entries-list-item row">
              <div className="entries-list-name seven columns">
                <h3>{name}</h3>
                <em>{city}</em>
              </div>
              <PreviewTile
                latitude={getLatitude(feature)}
                longitude={getLongitude(feature)}
                markerIcon={type}
              />
            </div>
            <div className="row">
              <div id="delete-entry-buttons">
                <button
                  className="delete-entry button"
                  onClick={() => deletePlace(feature)}
                >
                  Löschen
                </button>
                <Link to={MY_ENTRIES}>Abbrechen</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    )
  }
  return <Loading />
}

DeletePlace.propTypes = {
  feature: PropTypes.shape({
    name: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    latitude: PropTypes.string,
    longitude: PropTypes.string
  }).isRequired,
  deletePlace: PropTypes.func.isRequired
}

const mapStateToProps = ({ editor }) => ({
  feature: editor.feature
})

const mapDispatchToProps = {
  deletePlace: deleteFeature
}

const DeletePlaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeletePlace)

export default DeletePlaceContainer
