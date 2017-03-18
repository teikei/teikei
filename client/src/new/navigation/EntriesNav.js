import React from 'react'
import { Link } from 'react-router'
import { MY_ENTRIES, NEW_FARM, NEW_DEPOT } from '../AppRouter'
import Dropdown from './Dropdown'
import { i18n } from '../App'

const EntriesNavDropdown = () => (
  <ul>
    <li>
      <Link className="entries-nav-list" to={MY_ENTRIES}>
        {i18n.t('nav.my_entries')}
      </Link>
    </li>
    <li>
      <Link className="entries-nav-depot" to={NEW_DEPOT}>
        {i18n.t('nav.new_depot')}
      </Link>
    </li>
    <li>
      <Link className="entries-nav-farm" to={NEW_FARM}>
        {i18n.t('nav.new_farm')}
      </Link>
    </li>
  </ul>
)

const EntriesNav = () => (
  <Dropdown
    className="entries-nav"
    label={i18n.t('nav.edit_entries')}
    labelClassName="entries-nav-toggle"
    menuComponent={<EntriesNavDropdown />}
  />
)

export default EntriesNav
