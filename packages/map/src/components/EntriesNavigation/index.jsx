import React from 'react'
import { Link } from 'react-router-dom'
import {
  MY_ENTRIES,
  NEW_FARM,
  NEW_DEPOT,
  NEW_INITIATIVE
} from '../../AppRouter'
import Dropdown from '../DropdownMenu/index'
import i18n from '../../i18n'

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
    <li>
      <Link className="entries-nav-initiative" to={NEW_INITIATIVE}>
        {i18n.t('nav.new_initiative')}
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
