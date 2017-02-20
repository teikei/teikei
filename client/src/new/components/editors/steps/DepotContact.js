import React from 'react'
import { Field, reduxForm } from 'redux-form';

const DepotContact = () => (
  <div>
    <h3>Schritt 2 von 2</h3>
  </div>
)

DepotContact.propTypes = {}

const DepotContactForm = reduxForm({ form: 'depotcontact' })(DepotContact)

export default DepotContactForm
