import { Field, reduxForm, InjectedFormProps } from 'redux-form'

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
  if (submitSucceeded) {
    return (
      <form className='form-inputs' onSubmit={handleSubmit}>
        <b>Deine Nachricht wurde versandt.</b>
      </form>
    )
  }
  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>
      <Field
        name='senderName'
        label='Name und Vorname'
        component={InputField}
        maxLength='60'
        placeholder=''
        required
        type='text'
      />
      <Field
        name='senderEmail'
        label='E-Mail-Adresse'
        component={InputField}
        maxLength='100'
        placeholder=''
        required
        type='text'
      />
      <Field
        name='text'
        label='Deine Nachricht'
        component={TextAreaField}
        maxLength='1000'
        placeholder=''
        rows={8}
        required
        type='text'
      />
      <div className='form-actions'>
        <button className='button submit' type='submit'>
          Absenden
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'contact',
  validate: validator('entryContact')
})(ContactForm)
