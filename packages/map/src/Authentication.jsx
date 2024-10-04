import React, { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import Loading from './components/Loading'
import { authenticateUser } from './api/user'
import { useGlobalState } from './StateContext'

const withAuthentication = (WrappedComponent) => {
  return ({ ...props }) => {
    const { setCurrentUser } = useGlobalState()

    const authenticationMutation = useMutation({
      mutationFn: async () => {
        const response = await authenticateUser()
        if (response.user) {
          setCurrentUser(response.user)
        }
        return response
      },
      onError: (error) => {
        Alert.error(
          `Du konntest nicht registriert werden. Bitte überprüfe Deine Angaben. / ${error.message}`
        )
      }
    })

    useEffect(() => {
      authenticationMutation.mutate()
    }, [])

    return authenticationMutation.isLoading ? (
      <Loading />
    ) : (
      <WrappedComponent {...props} />
    )
  }
}

export default withAuthentication
