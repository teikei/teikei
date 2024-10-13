import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import PlaceDescription from './PlaceDescription'
import ContactTab from './ContactTab'
import Header from './Header'
import MembershipInfo from './MembershipInfo'
import { MAP } from '../../routes'
import i18n from '../../i18n'
import { getPlace } from '../../queries/places.api'
import { PlaceType } from '../../types/types'

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

  const getPlaceQuery = useQuery({
    queryKey: ['getPlace', type, id],
    queryFn: () => getPlace(type, id)
  })

  const [isContactActive, setIsContactActive] = useState(false)

  const toggleContact = () => {
    setIsContactActive(!isContactActive)
  }

  return getPlaceQuery.data ? (
    <article className='details'>
      <div className='details-container'>
        <div className='details-back'>
          <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
        </div>

        <Header feature={getPlaceQuery.data} />

        <div className='details-content'>
          <PlaceDescription feature={getPlaceQuery.data} />
        </div>

        <div className='details-contact'>
          <MembershipInfo feature={getPlaceQuery.data} />
          {isContactActive ? (
            <ContactTab feature={getPlaceQuery.data} />
          ) : (
            <ContactButton onClick={toggleContact} />
          )}
        </div>
      </div>
    </article>
  ) : null
}

export default Details
