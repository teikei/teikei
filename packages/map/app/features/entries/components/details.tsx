import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getPlaceQuery } from '~/api/get-place'
import { MAP } from '~/lib/routes'
import { featureTypeToPlaceType } from '~/types/types'
import type { Feature } from '~/types/types'

import ContactTab from './contact-tab'
import Header from './header'
import MembershipInfo from './membership-info'
import PlaceDescription from './place-description'

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

  const placeQuery = useQuery(
    getPlaceQuery({ type: featureTypeToPlaceType(type), id })
  )

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
