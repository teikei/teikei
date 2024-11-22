import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MY_ENTRIES, NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../../routes'
import Dropdown from '../base/DropdownMenu'

const EntriesNavigationDropdown = () => {
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

const EntriesNavigation = () => {
  const { t } = useTranslation()
  return (
    <Dropdown
      className='entries-nav'
      label={t('nav.edit_entries')}
      labelClassName='entries-nav-toggle'
      menuComponent={<EntriesNavigationDropdown />}
    />
  )
}

export default EntriesNavigation
