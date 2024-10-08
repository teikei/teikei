import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PlaceDescription from './components/PlaceDescription'
import ContactTabContainer from './tabs/ContactTabContainer'
import Header from './components/Header'
import MembershipInfo from './components/MembershipInfo'
import { MAP } from '../../AppRouter'
import i18n from '../../i18n'
import { getPlace } from '../../api/places'

const ContactButton = ({ onClick }) => (
  <button onClick={onClick} className='details-contact-button'>
    Kontakt
  </button>
)

const Details = () => {
  const { type, id } = useParams()

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
            <ContactTabContainer feature={getPlaceQuery.data} />
          ) : (
            <ContactButton onClick={toggleContact} />
          )}
        </div>

        {/* <Footer place={this.props.place} /> */}
      </div>
    </article>
  ) : null
}

export default Details
