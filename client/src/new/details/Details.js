import React, { Component } from 'react'
import { Link } from 'react-router'
import GeneralInformationTab from './tabs/GeneralInformationTab'
import ContactTab from './tabs/ContactTab'
import Header from './components/Header'
import Footer from './components/Footer'
import MembershipInfo from './components/MembershipInfo'
import { getMapPositionPath } from '../AppRouter'
import i18n from '../i18n'

class Details extends Component {

  constructor(props) {
    super(props)
    this.state = { tab: 0 }
  }

  activateTab(index) {
    this.setState({ tab: index })
  }

  isActive(index) {
    if (index === this.state.tab) {
      return 'active'
    }
    return ''
  }

  render() {
    const generalInformationActive = this.isActive(0)
    const membershipActive = this.isActive(1)
    const contactActive = this.isActive(2)

    const generalInformationTabHeader = (
      <dd>
        <button id="info-tab" onClick={() => this.activateTab(0)} className={generalInformationActive}>
          Allgemeine Informationen
        </button>
      </dd>
    )

    const contactTabHeader = (
      <dd>
        <button href="#" id="contact-tab" onClick={() => this.activateTab(2)} className={contactActive}>
          Kontakt aufnehmen
        </button>
      </dd>
    )

    const mapUrl = getMapPositionPath({
      lat: this.props.place.latitude,
      lon: this.props.place.longitude,
    })

    return (
      <div className="details" style={{ top: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
        <Link className="details-back" to={mapUrl}>
          {i18n.t('nav.go_back')}
        </Link>
        <article>
          <Header place={this.props.place} />

          <MembershipInfo place={this.props.place} />

          <div>
            <dl className="tabs">
              {generalInformationTabHeader}
              {contactTabHeader}
            </dl>

            <ul className="tabs-content">
              <GeneralInformationTab place={this.props.place} active={generalInformationActive} />
              <ContactTab place={this.props.place} active={contactActive} />
            </ul>
          </div>
          {/*<Footer place={this.props.place} />*/}
        </article>
      </div>
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
