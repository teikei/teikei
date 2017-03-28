import React from 'react'
import { Link } from 'react-router'
import { getEditPath } from '../../AppRouter'
import i18n from '../../i18n'

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
  i18n.t('months.december'),
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
  return (inThePast) ? i18n.t('forms.labels.since') : i18n.t('forms.labels.from')
}

const FoundedAt = (place) => {
  const foundedAtYear = place.founded_at_year || ''
  const foundedAtMonth = place.founded_at_month || ''
  const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1)
  const foundedAtMonthText = monthNames[foundedAtMonth - 1] || ''
  return (
    <p>
      {`Solidarische Landwirtschaft ${since} ${foundedAtMonthText} ${foundedAtYear}`}
    </p>
  )
}

function ownedByCurrentUser(place) {
  // todo: implement this
  return false
}

function getEditButton(place) {
  let editButton = null
  if (ownedByCurrentUser(place)) {
    editButton = (
      <Link to={getEditPath(place)} className="button edit">Eintrag editieren</Link>
    )
  }
  return editButton
}

const Header = props => (
  <header className="details-header">
    <h1 className="details-title">{props.place.name}</h1>
    {getEditButton(props.place)}
    {props.place.founded_at_year && FoundedAt(props.place)}

    <div className="details-meta">
      <p>{props.place.city}</p>
      {props.place.url && ExternalLink(props.place.url)}
    </div>
  </header>
)

Header.propTypes = {
  place: React.PropTypes.shape({
    name: React.PropTypes.string,
    city: React.PropTypes.string,
    url: React.PropTypes.string,
    founded_at_year: React.PropTypes.number,
  }).isRequired,
};

export default Header
