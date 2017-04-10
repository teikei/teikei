import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import UserInfo from './UserInfo'

const InitiativeForm = ({ handleSubmit, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <fieldset>
      <p>
        Hier kannst Du eine Initiative erfassen, die noch im Aufbau ist,
        um Partner, Mitglieder, Land oder einen Betrieb zu finden.
      </p>

      <label htmlFor="initiative_goals">Art der Initiative</label>
      <ul className="form-checkbox-group" id="initiative_goals" name="initiative_goals">
        <li>
          <Field
            name="initiative_goals"
            value="0"
            label="Ich/Wir sind KonsumentInnen und suchen Land."
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="initiative_goals"
            value="1"
            label="Ich/Wir sind KonsumentInnen und suchen eineN LandwirtIn/GärtnerIn."
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="initiative_goals"
            value="2"
            label="Ich/Wir sind KonsumentInnen und suchen Land und eineN LandwirtIn/GärtnerIn."
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="initiative_goals"
            value="3"
            label="Ich/Wir sind LandwirtInnen und suchen KonsumentInnen."
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="initiative_goals"
            value="4"
            label="Ich/Wir sind KonsumentInnen oder LandwirtInnen und suchen Mitglieder für unsere Kerngruppe."
            component={InputField}
            type="radio"
          />
        </li>
      </ul>

      <Field
        name="description"
        label="Beschreibung der Initiative"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten."
        rows="8"
      />
    </fieldset>
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

      <Field
        name="url"
        label="Website"
        component={InputField}
        placeholder="http://beispiel.de"
        type="url"
        maxLength="100"
      />

    </fieldset>

    <fieldset className="geocoder">

      <legend>geplanter Standort der Initiative</legend>

      <Field
        name="geocoder"
        label="Adresse und Ort"
        markerIcon="Initiative"
        component={Geocoder}
        required
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
