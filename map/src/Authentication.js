import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import Loading from './components/Loading'

import { authenticateUser } from './user/duck'

const withAuthentication = WrappedComponent => {
  class AuthenticatorComponent extends Component {
    componentDidMount() {
      const { authenticateUser } = this.props
      authenticateUser()
    }

    render() {
      return this.props.authenticated ? (
        <WrappedComponent {...this.props} />
      ) : (
        <Loading />
      )
    }
  }
  return connect(
    ({ user }) => ({ authenticated: user.authenticated }),
    { authenticateUser: () => authenticateUser() }
  )(AuthenticatorComponent)
}

export default withAuthentication
