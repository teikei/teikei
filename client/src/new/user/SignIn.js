import React, { Component } from 'react'
import SignInTab from './tabs/SignInTab'
import SignUpTab from './tabs/SignUpTab'

class UserSignIn extends Component {

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
    const signInActive = this.isActive(0)
    const signUpActive = this.isActive(1)

    return (
      <div className="details-view open" style={{ top: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
        <div className="container">
          <article>
            <dl className="tabs">
              <dd>
                <a
                  href="#signin"
                  id="signin-tab"
                  onClick={() => this.activateTab(0)}
                  className={signInActive}
                >Anmeldung</a>
              </dd>
              <dd>
                <a href="#signup" id="signup-tab" onClick={() => this.activateTab(1)} className={signUpActive}>Registrierung
                  für neue Nutzer</a>
              </dd>
            </dl>
            <ul className="tabs-content">
              <SignInTab {...this.props} active={signInActive} />
              <SignUpTab {...this.props} active={signUpActive} />
            </ul>
          </article>
        </div>
      </div>
    )
  }
}

export default UserSignIn
