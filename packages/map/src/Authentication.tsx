import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'

import Loading from './components/Loading'
import { authenticateUser } from './api/user'
import { useGlobalState } from './StateContext'

const withAuthentication = (WrappedComponent) => {
  return ({ ...props }) => {
    const { setCurrentUser, authenticationCompleted } = useGlobalState()

    const authenticationMutation = useMutation({
      mutationFn: async () => {
        const response = await authenticateUser()
        if (response.user) {
          setCurrentUser(response.user)
        }
        return response
      },
      onError: () => {
        setCurrentUser(null)
      }
    })

    useEffect(() => {
      authenticationMutation.mutate()
    }, [])

    return !authenticationCompleted ? (
      <Loading />
    ) : (
      <WrappedComponent {...props} />
    )
  }
}

export default withAuthentication
