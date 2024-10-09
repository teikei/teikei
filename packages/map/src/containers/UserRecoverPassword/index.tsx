import RecoverPasswordForm from './UserRecoverPasswordForm'
import { useMutation } from '@tanstack/react-query'
import { recoverUserPassword } from '../../queries/user'
import Alert from 'react-s-alert'
import { history, MAP } from '../../routes'

interface RecoverPasswordError {
  code: number
  message: string
}

interface RecoverPasswordParams {
  email: string
}

function handleRecoverPasswordError(error: RecoverPasswordError) {
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

const UserRecoverPassword = () => {
  const recoverPasswordMutation = useMutation({
    mutationFn: async (user: RecoverPasswordParams) => {
      const response = await recoverUserPassword(user)
      Alert.success(
        'Eine Email mit einem Wiederherstellungs-Link wurde an Dich versandt.'
      )
      // TODO reauth
      // dispatch(authenticateUser())
      history.push(MAP)
      return response
    },
    onError: (error: RecoverPasswordError) => {
      handleRecoverPasswordError(error)
    }
  })

  const handleSubmit = (values: RecoverPasswordParams) => {
    recoverPasswordMutation.mutate(values)
  }

  return <RecoverPasswordForm onSubmit={handleSubmit} />
}

export default UserRecoverPassword
