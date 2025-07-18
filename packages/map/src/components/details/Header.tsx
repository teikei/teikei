import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

import { monthNameKeys } from '@/common/i18nUtils.ts'
import { Feature } from '@/types/types'

const ExternalLink = (url: string) => (
  <a href={url} target='_blank' rel='noopener noreferrer'>
    {url}
  </a>
)

const temporalConnectionWord = (year: number, month: number) => {
  const foundedAt = new Date(year, month)
  const today = new Date()
  const inThePast = foundedAt < today
  return inThePast ? i18n.t('forms.labels.since') : i18n.t('forms.labels.from')
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
  const { t } = useTranslation()
  const since = temporalConnectionWord(foundedAtYear, foundedAtMonth - 1)
  const foundedAtMonthText = i18n.t(monthNameKeys[foundedAtMonth - 1]) || ''
  return (
    <p>
      {`${t('page.header.solawi')} ${since} ${foundedAtMonthText} ${foundedAtYear}`}
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
