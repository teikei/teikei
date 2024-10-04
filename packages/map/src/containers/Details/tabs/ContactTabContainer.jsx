import React from 'react'
import { useMutation } from '@tanstack/react-query'

import ContactForm from './ContactForm'
import Alert from 'react-s-alert'
import { history, MAP } from '../../../AppRouter'
import { sendPlaceMessage } from '../../query'

const ContactTab = ({ feature }) => {
  const sendPlaceMessageMutation = useMutation({
    mutationFn: async (formValues) => {
      const response = await sendPlaceMessage({
        id: feature.properties.id,
        type: feature.properties.type,
        ...formValues
      })
      if (response.id === feature.properties.id) {
        Alert.success('Deine Nachricht wurde versandt!')
        history.push(MAP)
      } else {
        throw new Error('Nachricht wurde nicht versandt.')
      }
    },
    onError: () => {
      Alert.error(
        'Deine Nachricht konnte nicht versandt werden. Bitte überprüfe Deine Angaben.'
      )
    }
  })

  const handleSubmit = (values) => {
    sendPlaceMessageMutation.mutate(values)
  }

  return (
    <div id='contact'>
      <div id='place-message-form-container'>
        <ContactForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default ContactTab
