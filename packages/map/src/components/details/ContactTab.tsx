import { useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate } from 'react-router'

import ContactForm, {
  ContactFormValues
} from '../../components/details/ContactForm'
import { MAP } from '../../routes'
import { sendPlaceMessage } from '../../queries/places.api'
import { Feature } from '../../types/types'

interface ContactTabProps {
  feature: Feature
}

const ContactTab = ({ feature }: ContactTabProps) => {
  const navigate = useNavigate()
  const sendPlaceMessageMutation = useMutation({
    mutationFn: async (formValues: ContactFormValues) => {
      const response = await sendPlaceMessage({
        id: feature.properties.id,
        type: feature.properties.type,
        ...formValues
      })
      if (response.id === feature.properties.id) {
        Alert.success('Deine Nachricht wurde versandt!')
        navigate(MAP)
      } else {
        throw new Error('Nachricht wurde nicht versandt.')
      }
    },
    meta: {
      errorMessage:
        'Deine Nachricht konnte nicht versandt werden. Bitte überprüfe Deine Angaben.'
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
