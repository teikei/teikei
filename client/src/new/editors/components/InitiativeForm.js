import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import UserInfo from './UserInfo'

const InitiativeForm = ({ handleSubmit, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <fieldset>

      <legend>Name</legend>

      <Field
        name="name"
        label="Bezeichnung der Initiative"
        component={InputField}
        type="text"
        maxLength="100"
        required
      />

    </fieldset>

    <fieldset className="geocoder">

      <legend>geplanter Standort der Initiative </legend>

      <Field
        name="geocoder"
        label="Adresse und Ort"
        markerIcon="Depot"
        component={Geocoder}
        required
      />

    </fieldset>

    <fieldset>

      <legend>Details</legend>

      <Field
        name="description"
        label="Beschreibung der Initiative"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten."
        rows="8"
      />

    </fieldset>

    <UserInfo user={user} />

    <div className="entries-editor-explanation">
      <p>
        Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.
      </p>
      <input type="submit" className="button submit" value="Speichern" />
    </div>

  </form>
)

InitiativeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape().isRequired,
}

export default reduxForm({ form: 'initiative  ' })(InitiativeForm)
