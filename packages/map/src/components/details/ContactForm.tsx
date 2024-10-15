import { Field, reduxForm, InjectedFormProps } from 'redux-form'
import { useTranslation } from 'react-i18next'

import InputField from '../base/InputField'
import TextAreaField from '../base/TextAreaField'
import { validator } from '../../common/formUtils'

interface ContactFormProps extends InjectedFormProps {}

export interface ContactFormValues {
  senderEmail: string
  senderName: string
  text: string
}

const ContactForm = ({
  handleSubmit,
  error = '',
  submitSucceeded = false
}: ContactFormProps) => {
  const { t } = useTranslation()
  if (submitSucceeded) {
    return (
      <form className='form-inputs' onSubmit={handleSubmit}>
        <b>{t('forms.contact.message_sent')}</b>
      </form>
    )
  }
  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>
      <Field
        name='senderName'
        label={t('forms.contact.name')}
        component={InputField}
        maxLength='60'
        placeholder=''
        required
        type='text'
      />
      <Field
        name='senderEmail'
        label={t('forms.contact.email')}
        component={InputField}
        maxLength='100'
        placeholder=''
        required
        type='text'
      />
      <Field
        name='text'
        label={t('forms.contact.message')}
        component={TextAreaField}
        maxLength='1000'
        placeholder=''
        rows={8}
        required
        type='text'
      />
      <div className='form-actions'>
        <button className='button submit' type='submit'>
          {t('forms.contact.submit')}
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'contact',
  validate: validator('entryContact')
})(ContactForm)
