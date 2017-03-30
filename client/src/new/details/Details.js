import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import PlaceDescription from './components/PlaceDescription'
import ContactTabContainer from './tabs/ContactTabContainer'
import Header from './components/Header'
import MembershipInfo from './components/MembershipInfo'
import { getMapPositionPath } from '../AppRouter'
import i18n from '../i18n'

const ContactButton = toggleContact => (
  <button onClick={toggleContact} className="details-contact-button">
    Kontakt
  </button>
)

const ContactTab = place => (
  <ContactTabContainer place={place} />
)

class Details extends Component {

  constructor(props) {
    super(props)
    this.state = { isContactActive: false }
  }

  toggleContact = () => {
    this.setState({
      isContactActive: !this.state.isContactActive,
    })
  }

  render() {
    const mapUrl = getMapPositionPath({
      lat: this.props.place.latitude,
      lon: this.props.place.longitude,
    })

    return (
      <article className="details">
        <div className="details-container">

          <Link className="details-back" to={mapUrl}>
            {i18n.t('nav.go_back')}
          </Link>

          <Header place={this.props.place} />

          <div className="details-content">
            <PlaceDescription place={this.props.place} />
          </div>

          <div className="details-contact">
            <MembershipInfo place={this.props.place} />
            {this.state.isContactActive ? ContactTab(this.props.place)
              : ContactButton(this.toggleContact)}
          </div>

          {/* <Footer place={this.props.place} /> */}
        </div>
      </article>
    )
  }
}

Details.propTypes = {
  place: PropTypes.shape({
    type: PropTypes.string.isRequired,
    latitude: PropTypes.string.isRequired,
    longitude: PropTypes.string.isRequired,
  }).isRequired,
};

export default Details
