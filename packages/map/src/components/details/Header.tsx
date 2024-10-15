import i18n from 'i18next'

import { Feature } from '../../types/types'
import { useTranslation } from 'react-i18next'

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

const ExternalLink = (url: string) => (
  <a href={url} target='_blank' rel='noopener noreferrer'>
    {url}
  </a>
)

const temporalConnectionWord = (year: number, month: number) => {
  const { t } = useTranslation()
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return inThePast ? t('forms.labels.since') : t('forms.labels.from')
}

interface FoundedAtProps {
  properties: {
    foundedAtYear?: number
    foundedAtMonth?: number
  }
}

const FoundedAt = ({
  properties: { foundedAtYear = 0, foundedAtMonth = 0 }
}: FoundedAtProps) => {
  const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1)
  const foundedAtMonthText = monthNames[foundedAtMonth - 1] || ''
  return (
    <p>
      {`Solidarische Landwirtschaft ${since} ${foundedAtMonthText} ${foundedAtYear}`}
    </p>
  )
}

interface HeaderProps {
  feature: Feature
}

const Header = ({ feature }: HeaderProps) => {
  const {
    properties: { name, foundedAtYear, postalcode, city, url }
  } = feature
  return (
    <header className='details-header'>
      <h1 className='details-title'>{name}</h1>
      {foundedAtYear && (
        <FoundedAt
          properties={{
            foundedAtYear,
            foundedAtMonth: feature.properties.foundedAtMonth
          }}
        />
      )}

      <div className='details-meta'>
        <p>
          {postalcode} {city}
        </p>
        {url && ExternalLink(url)}
      </div>
    </header>
  )
}

export default Header
