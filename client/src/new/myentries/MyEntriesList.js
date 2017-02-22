import React from 'react'
import MyEntriesListItem from './MyEntriesListItem'

const MyEntriesList = ({ onEditClick, onDeleteClick, onAddDepotClick, onAddFarmClick, places }) => (
  <div className="container">
    <section className="entrylist">
      <h1 className="title">Meine Einträge</h1>
      <ul className="entrylist-controls">
        <li>
          <a id="add-depot" href="#" onClick={() => onAddDepotClick()}>Abholstelle hinzufügen</a>
        </li>
        <li>
          <a id="add-farm" href="#" onClick={() => onAddFarmClick()}>Betrieb hinzufügen</a>
        </li>
      </ul>
      <div id="entrylist">
        {places.map(p =>
          <MyEntriesListItem
            key={p.id} place={p} onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />,
        )}
      </div>
    </section>
  </div>
)

MyEntriesList.propTypes = {
  onEditClick: React.PropTypes.func.isRequired,
  onDeleteClick: React.PropTypes.func.isRequired,
  onAddDepotClick: React.PropTypes.func.isRequired,
  onAddFarmClick: React.PropTypes.func.isRequired,
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

export default MyEntriesList
