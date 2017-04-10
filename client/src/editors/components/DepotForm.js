import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import { Link } from 'react-router'
import { NEW_FARM } from '../../AppRouter'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import SelectField from '../../common/SelectField'
import TextAreaField from '../../common/TextAreaField'
import UserInfo from './UserInfo'

const DepotForm = ({ handleSubmit, farms, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <fieldset>

      <legend>Name und Betrieb</legend>

      <Field
        name="name"
        label="Bezeichnung des Depots"
        component={InputField}
        type="text"
        maxLength="100"
        required
      />

      <Field
        name="url"
        label="Website"
        component={InputField}
        placeholder="http://beispiel.de"
        type="url"
        maxLength="100"
      />

      <Field
        name="places"
        label="Gehört zu Betrieb"
        component={SelectField}
        options={farms}
        valueKey="id"
        labelKey="name"
        format={value => value || []}
        required
        multi
      />

      <p className="entries-editor-explanation">
        Dein Betrieb fehlt auf der Liste? <Link to={NEW_FARM}>Neuen Betrieb eintragen</Link>
      </p>

    </fieldset>

    <fieldset className="geocoder">

      <legend>Standort des Depots</legend>

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
        label="Beschreibung des Depots"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten."
        rows="8"
      />

      <Field
        name="delivery_days"
        label="Abholtage"
        component={InputField}
        type="text"
        maxLength="100"
        placeholder="z.B. jeden zweiten Donnerstag"
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

DepotForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default reduxForm({ form: 'depot' })(DepotForm)
