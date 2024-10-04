import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { history, MAP } from '../../AppRouter'
import { updateUser } from '../../api/user'
import UserAccountForm from './UserAccountForm'

function handleUserAccountError(error) {
  if (error.code === 401) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe, ob du angemeldest bist.'
    )
  } else if (error.code === 422) {
    Alert.error(
      'Dein Benutzerkonto konnte nicht aktualisiert werden. Bitte überprüfe deine Eingaben.'
    )
  } else {
    Alert.error(
      `Dein Benutzerkonto konnte nicht gespeichert werden / ${error.message}`
    )
  }
}

const UserAccount = () => {
  const currentUser = useSelector((state) => state.user.currentUser)

  const updateUserMutation = useMutation({
    mutationFn: async (user) => {
      // TODO only send dirty values for identityChange
      // _.pick([..._.keys(dirtyValues(payload, initialValues)), 'password'])
      const response = await updateUser(user)
      if (response.id === user.id) {
        Alert.success('Dein Benutzerkonto wurde erfolgreich aktualisiert.')
        // TODO reauthenticate user to update user state
        history.push(MAP)
      } else {
        throw new Error('Benutzerkonto wurde nicht aktualisiert.')
      }
      return response
    },
    onError: (error) => {
      handleUserAccountError(error)
    }
  })

  const handleSubmit = (values) => {
    updateUserMutation.mutate(values)
  }

  return <UserAccountForm initialValues={currentUser} onSubmit={handleSubmit} />
}

UserAccount.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

UserAccount.defaultProps = {
  error: ''
}

export default UserAccount
