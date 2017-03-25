import React from 'react'
import { Link } from 'react-router'
import { Field, reduxForm } from 'redux-form';
import { SIGN_UP } from '../../AppRouter'
import i18n from '../../i18n'
import inputField from '../../common/inputField'

const SignInTab = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>{i18n.t('user.form.sign_in_title')}</h2>

    <p>
      {i18n.t('user.form.new')}
      <Link to={SIGN_UP}>{i18n.t('user.form.sign_up_link')}</Link>
    </p>

    <div className="form-inputs-big">

      <Field
        name="email"
        label={i18n.t('user.form.email')}
        component={inputField}
        type="email"
        maxLength="100"
      />

      <Field
        name="password"
        label={i18n.t('user.form.password')}
        component={inputField}
        type="password"
        maxLength="100"
      />

    </div>

    <div className="form-actions-big">

      <input
        type="submit"
        className="button"
        value={i18n.t('user.form.submit')}
      />

      <a href="users/password/new">
        {i18n.t('user.form.forgot_password')}
      </a>

    </div>

  </form>
)

SignInTab.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'signin' })(SignInTab)

