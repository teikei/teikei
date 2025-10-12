import { MAP } from '~/lib/routes'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'

import { sendPlaceMessage } from '~/queries/places.api'
import type { Feature } from '~/types/types'

import ContactForm from '../../components/details/ContactForm'
import type { ContactFormValues } from '../../components/details/ContactForm'

interface ContactTabProps {
  feature: Feature
}

const ContactTab = ({ feature }: ContactTabProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sendPlaceMessageMutation = useMutation({
    mutationFn: async (formValues: ContactFormValues) => {
      const response = await sendPlaceMessage({
        id: feature.properties.id,
        type: feature.properties.type,
        ...formValues
      })
      if (response.id === feature.properties.id) {
        Alert.success(t('forms.contact.message_success'))
        navigate(MAP)
      } else {
        throw new Error(t('errors.message_not_sent'))
      }
    },
    meta: {
      errorMessage: t('errors.message_not_sent_long_text')
    }
  })

  const handleSubmit = (values: ContactFormValues) => {
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
