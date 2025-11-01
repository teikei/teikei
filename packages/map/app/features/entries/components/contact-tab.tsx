import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Alert from 'react-s-alert'
import { useSendPlaceMessage } from '~/api/send-place-message'
import { MAP } from '~/lib/routes'
import type { Feature } from '~/types/types'

import ContactForm from './contact-form'
import type { ContactFormValues } from './contact-form'

interface ContactTabProps {
  feature: Feature
}

const ContactTab = ({ feature }: ContactTabProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sendPlaceMessageMutation = useSendPlaceMessage({
    meta: {
      errorMessage: t('errors.message_not_sent_long_text')
    },
    onSuccess: (response, variables) => {
      if (response.id !== variables.id) {
        Alert.error(t('errors.message_not_sent'))
        return
      }

      Alert.success(t('forms.contact.message_success'))
      navigate(MAP)
    }
  })

  const handleSubmit = (values: ContactFormValues) => {
    sendPlaceMessageMutation.mutate({
      id: feature.properties.id,
      type: feature.properties.type,
      ...values
    })
  }

  const ContactReduxForm = ContactForm as any

  return (
    <div id='contact'>
      <div id='place-message-form-container'>
        <ContactReduxForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default ContactTab
