import React from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../geocoder/GeocoderContainer'
import InputField from '../common/InputField'
import SelectField from '../common/SelectField'
import TextAreaField from '../common/TextAreaField'

const DepotForm = ({ handleSubmit, farms }) => (
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

    </fieldset>

    <p className="explanation">
      Falls der Betrieb noch nicht in der Liste vorhanden ist,
      kannst du ihn <a href="./farm">selbst eintragen</a>.
    </p>

    <fieldset className="geocoder">

      <legend>Standort des Depots</legend>
      <Field name="geocoder" component={props => <Geocoder markerIcon="Depot" {...props} />} />
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
    <h3>Schritt 2 von 2</h3>
    <fieldset>
      <legend>Kontaktdaten</legend>
      Deine aktuellen Kontaktdaten sind:<br />
      <p>
        Production Superadmin<br />
        Email-Adresse: admin@teikei.com<br />
        Telefon:
      </p>
      <p className="explanation">
        Die Daten kannst du in den
        <a href="users/edit" target="_blank" rel="noopener noreferrer">Benutzereinstellungen</a>
        anpassen.
      </p>
    </fieldset>
    <ul id="wizard-navigation" className="button-group">
      <li>
        <input type="submit" className="button submit" value="Speichern" />
      </li>
    </ul>
  </form>
)

DepotForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  farms: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

export default reduxForm({ form: 'depot' })(DepotForm)
