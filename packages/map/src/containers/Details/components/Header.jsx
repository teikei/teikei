import React from 'react'
import i18n from '../../../i18n/i18n'
import { featurePropType } from '../../../common/geoJsonUtils'

const monthNameI18nKeys = [
  'months.january',
  'months.february',
  'months.march',
  'months.april',
  'months.may',
  'months.june',
  'months.july',
  'months.august',
  'months.september',
  'months.october',
  'months.november',
  'months.december'
]

const ExternalLink = (url) => (
  <a href={url} target='_blank' rel='noopener noreferrer'>
    {url}
  </a>
)

const temporalConnectionWord = (year, month) => {
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return inThePast ? i18n.t('forms.labels.since') : i18n.t('forms.labels.from')
}

const FoundedAt = ({
  properties: { foundedAtYear = '', foundedAtMonth = '' }
}) => {
  const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1)
  const foundedAtMonthText = i18n.t(monthNameI18nKeys[foundedAtMonth - 1]) || ''
  return (
    <p>
      {`Solidarische Landwirtschaft ${since} ${foundedAtMonthText} ${foundedAtYear}`}
    </p>
  )
}

//  TODO implement: show edit button when user is logged in
// function ownedByCurrentUser(place) {
//   return false
// }
//
// function getEditButton(place) {
//   let editButton = null
//   if (ownedByCurrentUser(place)) {
//     editButton = (
//       <Link to={getEditPath(place)} className="button edit">Eintrag editieren</Link>
//     )
//   }
//   return editButton
// }

const Header = ({ feature }) => {
  const {
    properties: { name, foundedAtYear, postalcode, city, url }
  } = feature
  return (
    <header className='details-header'>
      <h1 className='details-title'>{name}</h1>
      {/* {getEditButton(props.place)} */}
      {foundedAtYear && FoundedAt(feature)}

      <div className='details-meta'>
        <p>
          {postalcode} {city}
        </p>
        {url && ExternalLink(url)}
      </div>
    </header>
  )
}

Header.propTypes = {
  feature: featurePropType
}

export default Header
