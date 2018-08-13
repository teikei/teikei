import React, { Component } from 'react'
import { Link } from 'react-router'
import PlaceDescription from './components/PlaceDescription'
import ContactTabContainer from './tabs/ContactTabContainer'
import Header from './components/Header'
import MembershipInfo from './components/MembershipInfo'
import { MAP } from '../AppRouter'
import i18n from '../i18n'
import { emptyFeature, featurePropType } from '../common/geoJsonUtils'

const ContactButton = toggleContact => (
  <button onClick={toggleContact} className="details-contact-button">
    Kontakt
  </button>
)

const ContactTab = place => <ContactTabContainer place={place} />

class Details extends Component {
  constructor(props) {
    super(props)
    this.state = { isContactActive: false }
  }

  toggleContact = () => {
    this.setState({
      isContactActive: !this.state.isContactActive
    })
  }

  render() {
    const {feature} = this.props
    return (
      <article className="details">
        <div className="details-container">
          <div className="details-back">
            <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
          </div>

          <Header feature={feature} />

          <div className="details-content">
            <PlaceDescription feature={feature} />
          </div>

          <div className="details-contact">
            <MembershipInfo feature={feature} />
            {this.state.isContactActive
              ? ContactTab(feature)
              : ContactButton(this.toggleContact)}
          </div>

          {/* <Footer place={this.props.place} /> */}
        </div>
      </article>
    )
  }
}

Details.propTypes = {
  feature: featurePropType.isRequired
}

Details.defaultProps = {
  feature: emptyFeature
}


export default Details
