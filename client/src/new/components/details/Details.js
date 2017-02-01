import React, { Component } from 'react'
import MembershipTab from './tabs/MembershipTab'
import GeneralInformationTab from './tabs/GeneralInformationTab'
import ContactTab from './tabs/ContactTab'
import Header from './Header'
import Footer from './Footer'

// TODO refactor duplicate code in DepotDetails / FarmDetails / Details

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
        <a href="#" id="info-tab" onClick={() => this.activateTab(0)} className={generalInformationActive}>Allgemeine
          Informationen</a>
      </dd>
    )

    let membershipTabHeader = null
    let membershipTab = null
    if (this.props.place.type === 'Farm') {
      membershipTabHeader = (
        <dd>
          <a href="#" onClick={() => this.activateTab(1)} className={membershipActive}>Mitgliedschaft</a>
        </dd>
      )
      membershipTab = <MembershipTab place={this.props.place} active={membershipActive} />
    }

    const contactTabHeader = (
      <dd>
        <a href="#" id="contact-tab" onClick={() => this.activateTab(2)} className={contactActive}>Kontakt
          aufnehmen</a>
      </dd>
    )

    return (
      <div className="details-view open" style={{ top: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
        <div className="container">
          <article>
            <Header place={this.props.place} />
            <div>
              <dl className="tabs">
                {generalInformationTabHeader}
                {membershipTabHeader}
                {contactTabHeader}
              </dl>

              <ul className="tabs-content">
                <GeneralInformationTab place={this.props.place} active={generalInformationActive} />
                {membershipTab}
                <ContactTab place={this.props.place} active={contactActive} />
              </ul>
            </div>
            <Footer place={this.props.place} />
          </article>
        </div>
      </div>
    )
  }
}

Details.propTypes = {
  place: React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
  }).isRequired,
};

export default Details
