import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import PlaceDescription from './PlaceDescription'
import ContactTab from './ContactTab'
import Header from './Header'
import MembershipInfo from './MembershipInfo'
import { MAP } from '../../routes'
import { Feature, featureTypeToPlaceType } from '../../types/types'
import { getPlaceQuery } from '../../queries/places.queries.ts'

interface ContactButtonProps {
  onClick: () => void
}

const ContactButton = ({ onClick }: ContactButtonProps) => {
  const { t } = useTranslation()
  return (
    <button onClick={onClick} className='details-contact-button'>
      {t('places.details.contact')}
    </button>
  )
}

interface DetailsProps {
  feature: Feature
}

const Details = ({ feature }: DetailsProps) => {
  const { t } = useTranslation()

  if (!feature || !feature.properties.type || !feature.properties.id) {
    throw new Error('type and id required.')
  }

  const { type, id } = feature.properties

  const placeQuery = useQuery(getPlaceQuery(featureTypeToPlaceType(type), id))

  const [isContactActive, setIsContactActive] = useState(false)

  const toggleContact = () => {
    setIsContactActive(!isContactActive)
  }

  return placeQuery.data ? (
    <article className='details'>
      <div className='details-container'>
        <div className='details-back'>
          <Link to={MAP}>{t('nav.go_back')}</Link>
        </div>

        <Header feature={placeQuery.data} />

        <div className='details-content'>
          <PlaceDescription feature={placeQuery.data} />
        </div>

        <div className='details-contact'>
          <MembershipInfo feature={placeQuery.data} />
          {isContactActive ? (
            <ContactTab feature={placeQuery.data} />
          ) : (
            <ContactButton onClick={toggleContact} />
          )}
        </div>
      </div>
    </article>
  ) : null
}

export default Details
