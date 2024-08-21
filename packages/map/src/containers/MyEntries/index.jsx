import { connect, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n/i18n'
import MyEntriesListItem from './MyEntriesListItem'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../../AppRouter'
import { featurePropType } from '../../common/geoJsonUtils'
import { fetchMyEntries } from '../Map/duck'

const placesList = (features) => {
  if (features.length === 0) {
    return <div>{i18n.t('entries.no_entries')}</div>
  }
  return features.map((f) => (
    <MyEntriesListItem key={f.properties.id} feature={f} />
  ))
}

const MyEntriesList = ({ features }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchMyEntries())
  }, [])

  return (
    <div className='entries-editor-container'>
      <section className='entries-list'>
        <h1 className='title'>{t('entries.my_entries')}</h1>
        <ul className='entries-list-controls'>
          <li>
            <Link to={NEW_DEPOT}>{t('entries.new_depot')}</Link>
          </li>
          <li>
            <Link to={NEW_FARM}>{t('entries.new_farm')}</Link>
          </li>
          <li>
            <Link to={NEW_INITIATIVE}>{t('entries.new_initiative')}</Link>
          </li>
        </ul>
        {placesList(features)}
      </section>
    </div>
  )
}

MyEntriesList.propTypes = {
  features: PropTypes.arrayOf(featurePropType).isRequired
}

const mapStateToProps = ({ map }) => ({
  features: map.myentries.features
})

const mapDispatchToProps = {
  fetchMyEntries
}

const MyEntriesListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyEntriesList)

export default MyEntriesListContainer
