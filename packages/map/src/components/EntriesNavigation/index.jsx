import React from 'react'
import { Link } from 'react-router-dom'
import {
  MY_ENTRIES,
  NEW_FARM,
  NEW_DEPOT,
  NEW_INITIATIVE
} from '../../AppRouter'
import Dropdown from '../DropdownMenu/index'
import { useTranslation } from 'react-i18next'

const EntriesNavDropdown = () => {
  const { t } = useTranslation()
  return (
    <ul>
      <li>
        <Link className='entries-nav-list' to={MY_ENTRIES}>
          {t('nav.my_entries')}
        </Link>
      </li>
      <li>
        <Link className='entries-nav-depot' to={NEW_DEPOT}>
          {t('nav.new_depot')}
        </Link>
      </li>
      <li>
        <Link className='entries-nav-farm' to={NEW_FARM}>
          {t('nav.new_farm')}
        </Link>
      </li>
      <li>
        <Link className='entries-nav-initiative' to={NEW_INITIATIVE}>
          {t('nav.new_initiative')}
        </Link>
      </li>
    </ul>
  )
}

const EntriesNav = () => {
  const { t } = useTranslation(['common'])

  return (
    <Dropdown
      className='entries-nav'
      label={t('nav.edit_entries')}
      labelClassName='entries-nav-toggle'
      menuComponent={<EntriesNavDropdown />}
    />
  )
}

export default EntriesNav
