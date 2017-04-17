import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import MyEntriesListItem from './MyEntriesListItem'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../AppRouter'

const placesList = (places) => {
  if (places.length === 0) {
    return (<div>Keine Einträge vorhanden.</div>)
  }
  return places.map(p =>
    <MyEntriesListItem key={p.id} place={p} />,
  )
}

const MyEntriesList = ({ places }) => (
  <div className="entries-editor-container">
    <section className="entries-list">
      <h1 className="title">Meine Einträge</h1>
      <ul className="entries-list-controls">
        <li>
          <Link to={NEW_DEPOT}>Abholstelle hinzufügen</Link>
        </li>
        <li>
          <Link to={NEW_FARM}>Betrieb hinzufügen</Link>
        </li>
        <li>
          <Link to={NEW_INITIATIVE}>Initiative hinzufügen</Link>
        </li>
      </ul>
      {placesList(places)}
    </section>
  </div>
)

MyEntriesList.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default MyEntriesList
