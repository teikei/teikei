import React from 'react'
import { Link } from 'react-router'
import MembershipInfo from './MembershipInfo'
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

function ownedByCurrentUser(place) {
  // todo: implement this
  return place
}

function temporalConnectionWord(year, month) {
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return (inThePast) ? i18n.t('forms.labels.since') : i18n.t('forms.labels.from')
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

function getAgriCultureInfo(place) {
  let agricultureInfo = null
  if (place.type === 'Farm') {
    const foundedAtYear = place.founded_at_year;
    const foundedAtMonth = place.founded_at_month;
    const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1);
    const foundedAtMonthText = monthNames[foundedAtMonth - 1];
    agricultureInfo = `| Solidarische Landwirtschaft ${since} ${foundedAtMonthText} ${foundedAtYear}`
  }
  return agricultureInfo
}

const Header = props => (
  <div>
    <header>
      <h1 className="title">{props.place.name}</h1>
      <MembershipInfo place={props.place} />
      {getEditButton(props.place)}
    </header>
    <span className="city">{props.place.city}</span>
    {getAgriCultureInfo(props.place)}
  </div>
)

Header.propTypes = {
  place: React.PropTypes.shape({
    name: React.PropTypes.string,
    city: React.PropTypes.string,
  }).isRequired,
};

export default Header
