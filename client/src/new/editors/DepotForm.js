import React from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from './geocoder/GeocoderContainer'
import inputField from './inputField'

const required = value => (
  value ? undefined : 'Required'
)

const DepotForm = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <h3>Schritt 1 von 2</h3>
    <fieldset>

      <legend>Name und Betrieb</legend>

      <Field
        name="name"
        label="Bezeichnung des Depots"
        component={inputField}
        type="text"
        maxLength="100"
        validate={[required]}
      />

      <Field
        name="places"
        label="Gehört zu Betrieb"
        component={inputField}
        type="text"
        maxLength="100"
        validate={[required]}
      />

    </fieldset>

    <p className="explanation">
      Falls der Betrieb noch nicht in der Liste vorhanden ist,
      kannst du <a href="/map#places/new/farm">ihn hier selbst eintragen</a>.
    </p>

    <fieldset className="geocoder">
      <legend>Standort des Depots</legend>
      <Field name="geocoder" component={props => <Geocoder {...props} />} />
    </fieldset>

    <fieldset>
      <legend>Details</legend>
      <label htmlFor="description">Beschreibung des Depots</label>
      <div>
        <Field
          name="description" component="textarea" type="text" maxLength="1000"
          placeholder="z.B. Informationen zum Hintergrund, zu den Betreibern oder zur Geschichte des Betriebs."
          rows="8"
        />
      </div>
      <label htmlFor="delivery_days">Abholtage</label>
      <div>
        <Field name="delivery_days" component="textarea" type="text" maxLength="1000" />
      </div>
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

DepotForm.propTypes = DepotForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
}

export default reduxForm({ form: 'depot' })(DepotForm)
