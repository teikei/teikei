import React, { Component } from 'react'
import { Link } from 'react-router'
import PlaceDescription from './components/PlaceDescription'
import ContactTabContainer from './tabs/ContactTabContainer'
import Header from './components/Header'
import MembershipInfo from './components/MembershipInfo'
import { getMapPositionPath } from '../AppRouter'
import i18n from '../i18n'

class Details extends Component {

  constructor(props) {
    super(props)
    this.state = { isContactActive: false }
  }

  showContact = () => {
    this.setState({ isContactActive: true })
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
            <MembershipInfo place={this.props.place} />
            <PlaceDescription place={this.props.place} />
            <button onClick={this.showContact} className={this.state.showContact}>
              Kontakt aufnehmen
            </button>
            {this.state.isContactActive && <ContactTabContainer place={this.props.place} />}
          </div>
          {/* <Footer place={this.props.place} /> */}
        </div>
      </article>
    )
  }
}

Details.propTypes = {
  place: React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
    latitude: React.PropTypes.string.isRequired,
    longitude: React.PropTypes.string.isRequired,
  }).isRequired,
};

export default Details
