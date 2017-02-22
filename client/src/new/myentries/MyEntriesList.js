import React from 'react'
import { Link } from 'react-router'
import MyEntriesListItem from './MyEntriesListItem'
import { NEW_DEPOT, NEW_FARM } from '../AppRouter'

const MyEntriesList = ({ places }) => (
  <div className="container">
    <section className="entrylist">
      <h1 className="title">Meine Einträge</h1>
      <ul className="entrylist-controls">
        <li>
          <Link to={NEW_DEPOT}>Abholstelle hinzufügen</Link>
        </li>
        <li>
          <Link to={NEW_FARM}>Betrieb hinzufügen</Link>
        </li>
      </ul>
      <div id="entrylist">
        {places.map(p =>
          <MyEntriesListItem key={p.id} place={p} />,
        )}
      </div>
    </section>
  </div>
)

MyEntriesList.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

export default MyEntriesList
