import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import PlaceDescription from './PlaceDescription'
import ContactTab from './ContactTab'
import Header from './Header'
import MembershipInfo from './MembershipInfo'
import { MAP } from '../../routes'
import i18n from '../../i18n'
import { PlaceType } from '../../types/types'
import { getPlaceQuery } from '../../queries/places.queries.ts'

interface ContactButtonProps {
  onClick: () => void
}

const ContactButton = ({ onClick }: ContactButtonProps) => (
  <button onClick={onClick} className='details-contact-button'>
    Kontakt
  </button>
)

const Details = () => {
  const { type, id } = useParams<{ type: PlaceType; id: string }>()

  if (!type || !id) {
    throw new Error('type and id required.')
  }

  const placeQuery = useQuery(getPlaceQuery(type, id))

  const [isContactActive, setIsContactActive] = useState(false)

  const toggleContact = () => {
    setIsContactActive(!isContactActive)
  }

  return placeQuery.data ? (
    <article className='details'>
      <div className='details-container'>
        <div className='details-back'>
          <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
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
