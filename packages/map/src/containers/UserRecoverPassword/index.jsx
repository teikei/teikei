import React from 'react'

import RecoverPasswordForm from './RecoverPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { recoverUserPassword } from '../../api/user'
import Alert from 'react-s-alert'
import { history, MAP } from '../../AppRouter'

function handleRecoverPasswordError(error) {
  if (error.code === 401) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (error.code === 422) {
    Alert.error(
      'Dein Passwort konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${error.message}`
    )
  }
}

const RecoverPassword = () => {
  const recoverPasswordMutation = useMutation({
    mutationFn: async (user) => {
      const response = await recoverUserPassword(user)
      Alert.success(
        'Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.'
      )
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
    recoverPasswordMutation.mutate(values)
  }

  return <RecoverPasswordForm onSubmit={handleSubmit} />
}

export default RecoverPassword
