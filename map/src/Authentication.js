import React, { useEffect } from 'react'
import Loading from './components/Loading'

import { authenticateUser } from './containers/UserOnboarding/duck'
import { useDispatch, useSelector } from 'react-redux'

const withAuthentication = (WrappedComponent) => ({ ...props }) => {
  const dispatch = useDispatch()
  const authenticated = useSelector((state) => state.user.authenticated)
  useEffect(() => {
    dispatch(authenticateUser())
  }, [])

  return authenticated ? <WrappedComponent {...props} /> : <Loading />
}

export default withAuthentication
