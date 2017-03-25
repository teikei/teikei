import React from 'react'
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router'
import { SIGN_IN } from '../../AppRouter'
import i18n from '../../i18n'

const SignUpTab = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <h2>{i18n.t('user.form.sign_up_title')}</h2>

    <p>
      {i18n.t('user.form.existing')}
      <Link to={SIGN_IN}>{i18n.t('user.form.sign_in_link')}</Link>
    </p>

    <div className="form-inputs-big">

    </div>

    <p>
      {i18n.t('user.form.confirmation')}
      <a href="https://ernte-teilen.org/terms">{i18n.t('user.form.terms')}</a>
    </p>

    <div className="form-actions-big">
      <input
        type="submit"
        className="button"
        value={i18n.t('user.form.submit')}
      />
    </div>
  </form>
)

SignUpTab.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'signin' })(SignUpTab)
