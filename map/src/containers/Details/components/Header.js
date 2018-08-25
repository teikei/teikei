import React from 'react'
import i18n from '../../../i18n'
import { featurePropType } from '../../../common/geoJsonUtils'

const monthNames = [
  i18n.t('months.january'),
  i18n.t('months.february'),
  i18n.t('months.march'),
  i18n.t('months.april'),
  i18n.t('months.may'),
  i18n.t('months.june'),
  i18n.t('months.july'),
  i18n.t('months.august'),
  i18n.t('months.september'),
  i18n.t('months.october'),
  i18n.t('months.november'),
  i18n.t('months.december')
]

const ExternalLink = url => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {url}
  </a>
)

const temporalConnectionWord = (year, month) => {
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return inThePast ? i18n.t('forms.labels.since') : i18n.t('forms.labels.from')
}

const FoundedAt = ({properties: {foundedAtYear = '', foundedAtMonth = ''}}) => {
  const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1)
  const foundedAtMonthText = monthNames[foundedAtMonth - 1] || ''
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
    properties: { name, foundedAtYear, city, url }
  } = feature
  return (
    <header className="details-header">
      <h1 className="details-title">{name}</h1>
      {/* {getEditButton(props.place)} */}
      {foundedAtYear && FoundedAt(feature)}

      <div className="details-meta">
        <p>{city}</p>
        {url && ExternalLink(url)}
      </div>
    </header>
  )
}

Header.propTypes = {
  feature: featurePropType
}

export default Header
