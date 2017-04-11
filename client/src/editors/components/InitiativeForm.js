import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import CheckboxGroup from '../../common/CheckboxGroup'
import UserInfo from './UserInfo'

const InitiativeForm = ({ handleSubmit, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">
    <fieldset>
      <p>
        Hier kannst Du eine Initiative erfassen, die noch im Aufbau ist,
        um Partner, Mitglieder, Land oder einen Betrieb zu finden.
      </p>

      <label htmlFor="goal_keys">Art der Initiative</label>
      <Field
        name="goal_keys"
        groupLabel=""
        component={CheckboxGroup}
        options={[
          {
            name: 0,
            label: 'Wir suchen Land oder Hof',
          },
          {
            name: 1,
            label: 'Wir suchen GärtnerInnnen oder LandwirtInnen',
          },
          {
            name: 2,
            label: 'Wir suchen Mitglieder für unser Organisationsteam',
          },
          {
            name: 3,
            label: 'Wir suchen KonsumentInnen',
          },
        ]}
      />

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
