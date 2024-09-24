import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PlaceDescription from './components/PlaceDescription'
import ContactTabContainer from './tabs/ContactTabContainer'
import Header from './components/Header'
import MembershipInfo from './components/MembershipInfo'
import { MAP } from '../../AppRouter'
import i18n from '../../i18n'
import { emptyFeature, featurePropType } from '../../common/geoJsonUtils'

const ContactButton = (toggleContact) => (
  <button onClick={toggleContact} className='details-contact-button'>
    Kontakt
  </button>
)

const ContactTab = (feature) => <ContactTabContainer feature={feature} />

const Details = ({ feature }) => {
  const [isContactActive, setIsContactActive] = useState(false)

  const toggleContact = () => {
    setIsContactActive(!isContactActive)
  }

  return (
    <article className='details'>
      <div className='details-container'>
        <div className='details-back'>
          <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
        </div>

        <Header feature={feature} />

        <div className='details-content'>
          <PlaceDescription feature={feature} />
        </div>

        <div className='details-contact'>
          <MembershipInfo feature={feature} />
          {isContactActive ? ContactTab(feature) : ContactButton(toggleContact)}
        </div>

        {/* <Footer place={this.props.place} /> */}
      </div>
    </article>
  )
}

Details.propTypes = {
  feature: featurePropType.isRequired
}

Details.defaultProps = {
  feature: emptyFeature
}

export default Details
