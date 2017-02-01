import React from 'react'
import MembershipInfo from './MembershipInfo'

const monthNames = [
  I18n.t('months.january'),
  I18n.t('months.february'),
  I18n.t('months.march'),
  I18n.t('months.april'),
  I18n.t('months.may'),
  I18n.t('months.june'),
  I18n.t('months.july'),
  I18n.t('months.august'),
  I18n.t('months.september'),
  I18n.t('months.october'),
  I18n.t('months.november'),
  I18n.t('months.december'),
]

function ownedByCurrentUser(place) {
  // todo: implement this
  return place
}

function temporalConnectionWord(year, month) {
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return (inThePast) ? I18n.t('forms.labels.since') : I18n.t('forms.labels.from')
}

function getEditButton(place) {
  let editButton = null
  if (ownedByCurrentUser(place)) {
    editButton = (
      <button href="places/<%= id %>/edit" title="Eintrag editieren" id="edit-place" className="button edit">
        Editieren
      </button>
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
