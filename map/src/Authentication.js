import React, { useEffect } from 'react'
import Loading from './components/Loading'

import { authenticateUser } from './containers/UserOnboarding/duck'
import { useDispatch, useSelector } from 'react-redux'

const withAuthentication =
  (WrappedComponent) =>
  ({ ...props }) => {
    const dispatch = useDispatch()
    const authenticationCompleted = useSelector(
      (state) => state.user.authenticationCompleted
    )
    useEffect(() => {
      dispatch(authenticateUser())
    }, [])

    return authenticationCompleted ? (
      <WrappedComponent {...props} />
    ) : (
      <Loading />
    )
  }

export default withAuthentication
