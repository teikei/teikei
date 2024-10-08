import React, { useEffect } from 'react'
import { withRouter } from 'react-router'

import { history, MAP, useQueryString } from '../../AppRouter'
import UserRecoverPasswordForm from '../UserRecoverPassword/UserRecoverPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { resetUserPassword } from '../../api/user'
import Alert from 'react-s-alert'

const UserResetPassword = () => {
  const queryString = useQueryString()
  useEffect(() => {
    // don't allow access without reset_password_token
    if (!queryString.has('reset_password_token')) {
      history.push(MAP)
    }
  }, [])

  const resetPasswordMutation = useMutation({
    mutationFn: async (passwordResetParams) => {
      const response = await resetUserPassword({
        resetPasswordToken: queryString.get('reset_password_token'),
        ...passwordResetParams
      })
      Alert.success('Dein Passwort wurde erfolgreich geändert.')
      // TODO reauth
      // dispatch(authenticateUser())
      history.push(MAP)
      return response
    },
    onError: (error) => {
      Alert.error(
        `Dein Passwort konnte nicht wiederhergestellt werden. / ${error.message}`
      )
    }
  })

  const handleSubmit = (values) => {
    resetPasswordMutation.mutate(values)
  }
  return <UserRecoverPasswordForm onSubmit={handleSubmit} />
}

export default withRouter(UserResetPassword)
