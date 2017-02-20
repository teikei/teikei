import React from 'react'
import { Field, reduxForm } from 'redux-form';

const DepotForm = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <h3>Schritt 1 von 2</h3>
    <fieldset>
      <legend>Name und Betrieb</legend>
      <label htmlFor="name">Bezeichnung des Depots</label>
      <Field name="name" component="input" type="text" maxLength="100" />
      <label htmlFor="places">Gehört zu Betrieb</label>
      <Field name="places" component="input" type="text" value="" maxLength="100" />
    </fieldset>
    <p className="explanation">
      Falls der Betrieb noch nicht in der Liste vorhanden ist,
      kannst du <a href="/map#places/new/farm">ihn hier selbst eintragen</a>.
    </p>
    <fieldset className="geocoder">
      <legend>Standort des Depots</legend>
      <label htmlFor="address">Straße und Hausnummer</label>
      <div>
        <Field name="address" component="input" type="text" maxLength="100" />
      </div>
      <label htmlFor="city">Ort</label>
      <div>
        <Field name="city" component="input" type="text" maxLength="100" />
      </div>
      <button className="small button preview-button">Ort auf Karte anzeigen</button>

      <p className="explanation">
        Diese Angaben werden ausschließlich dazu verwendet, den Ort auf der Karte zu markieren.
        Die Adresse wird weder im Web veröffentlicht noch anderweitig weitergegeben.
      </p>
      <div className="preview-map">
        <img className="preview-marker leaflet-marker-icon" />
        <div className="alert-box alert" />
      </div>
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
};

export default reduxForm({ form: 'depot' })(DepotForm)
