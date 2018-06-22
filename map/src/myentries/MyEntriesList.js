import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import MyEntriesListItem from './MyEntriesListItem'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../AppRouter'
import i18n from '../i18n'

const placesList = places => {
  if (places.length === 0) {
    return <div>{i18n.t('entries.no_entries')}</div>
  }
  return places.map(p => <MyEntriesListItem key={p.id} place={p} />)
}

const MyEntriesList = ({ places }) => (
  <div className="entries-editor-container">
    <section className="entries-list">
      <h1 className="title">{i18n.t('entries.my_entries')}</h1>
      <ul className="entries-list-controls">
        <li>
          <Link to={NEW_DEPOT}>{i18n.t('entries.new_depot')}</Link>
        </li>
        <li>
          <Link to={NEW_FARM}>{i18n.t('entries.new_farm')}</Link>
        </li>
        <li>
          <Link to={NEW_INITIATIVE}>{i18n.t('entries.new_initiative')}</Link>
        </li>
      </ul>
      {placesList(places)}
    </section>
  </div>
)

MyEntriesList.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default MyEntriesList
