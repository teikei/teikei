import React from 'react'
import { Field, reduxForm } from 'redux-form';

const DepotBasics = () => (
  <div>
    <h3>Schritt 1 von 2</h3>
  </div>
)

DepotBasics.propTypes = {}

const DepotBasicsForm = reduxForm({ form: 'depotbasics' })(DepotBasics)

export default DepotBasicsForm
