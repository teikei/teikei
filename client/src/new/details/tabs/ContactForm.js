import React from 'react'
import { Field, reduxForm } from 'redux-form'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import i18n from '../../i18n'

const ContactForm = ({ handleSubmit, error, submitSucceeded }) => {
  if (submitSucceeded) {
    return (<form className="form-inputs" onSubmit={handleSubmit}>
      <b>Deine Nachricht wurde versandt.</b>
    </form>)
  }
  return (
    <form className="form-inputs" onSubmit={handleSubmit}>
      <div className="form-inputs-big">
        <strong>{ error }</strong>
        <Field
          name="name"
          label="Name und Vorname"
          component={InputField}
          maxLength="60"
          placeholder=""
          required
          type="text"
        />
        <Field
          name="email"
          label="E-Mail-Adresse"
          component={InputField}
          maxLength="100"
          placeholder=""
          required
          type="text"
        />
        <Field
          name="message"
          label="Deine Nachricht"
          component={TextAreaField}
          maxLength="1000"
          placeholder=""
          rows="8"
          required
          type="text"
        />
      </div>
      <div className="form-actions-big">
        <button className="button submit" type="submit">Absenden</button>
      </div>
    </form>
  )
}

ContactForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  error: React.PropTypes.string,
  submitSucceeded: React.PropTypes.bool,
}

ContactForm.defaultProps = {
  error: '',
  submitSucceeded: false,
}

const validate = (values) => {
  const errors = {}
  if (!values.name) {
    errors.name = i18n.t('forms.validation.required')
  }
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.message) {
    errors.message = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm({ form: 'contact' }, validate)(ContactForm)

