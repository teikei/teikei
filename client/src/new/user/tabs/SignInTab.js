import React from 'react'
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router'
import { SIGN_UP } from '../../AppRouter'
import i18n from '../../i18n'

const SignInTab = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>{i18n.t('user.form.sign_in_title')}</h2>

    <p>
      {i18n.t('user.form.new')}
      <Link to={SIGN_UP}>{i18n.t('user.form.sign_up_link')}</Link>
    </p>

    <div className="form-inputs-big">
      <label htmlFor="email">{i18n.t('user.form.email')}</label>
      <Field name="email" component="input" type="text" maxLength="100" />
      <label htmlFor="password" maxLength="100">{i18n.t('user.form.password')}</label>
      <Field name="password" component="input" type="password" />
    </div>

    <div className="form-actions-big">
      <input
        type="submit"
        className="button"
        value={i18n.t('user.form.submit')}
      />
      <a href="users/password/new">{i18n.t('user.form.forgot_password')}</a>
    </div>

  </form>
)

SignInTab.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'signin' })(SignInTab)

