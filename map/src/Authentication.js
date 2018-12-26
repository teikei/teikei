import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import Loading from './components/Loading'

import { authenticateUser } from './containers/UserOnboarding/duck'

const withAuthentication = WrappedComponent => {
  class AuthenticatorComponent extends Component {
    componentDidMount() {
      const { authenticateUserFn } = this.props
      authenticateUserFn()
    }

    render() {
      const { authenticated } = this.props
      return authenticated ? <WrappedComponent {...this.props} /> : <Loading />
    }
  }
  return connect(
    ({ user }) => ({ authenticated: user.authenticated }),
    { authenticateUserFn: () => authenticateUser() }
  )(AuthenticatorComponent)
}

export default withAuthentication
