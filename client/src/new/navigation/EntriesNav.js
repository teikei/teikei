import React from 'react'
import { Link } from 'react-router'
import { MY_ENTRIES, NEW_FARM, NEW_DEPOT } from '../AppRouter'
import Dropdown from './Dropdown'

const EntriesNavDropdown = () => (
  <ul>
    <li>
      <Link to={MY_ENTRIES}>{I18n.t('nav.my_entries')}</Link>
    </li>
    <li>
      <Link to={NEW_DEPOT}>{I18n.t('nav.new_depot')}</Link>
    </li>
    <li>
      <Link to={NEW_FARM}>{I18n.t('nav.new_farm')}</Link>
    </li>
  </ul>
)

const EntriesNav = () => (
  <Dropdown
    className="entries-nav"
    label={I18n.t('nav.new_entry')}
    labelClassName="entries-nav-toggle"
    menuComponent={EntriesNavDropdown()}
  />
)

export default EntriesNav
