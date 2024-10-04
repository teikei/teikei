import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Field, Fields, reduxForm } from 'redux-form'
import { Link } from 'react-router-dom'

import { NEW_FARM } from '../../../AppRouter'
import Geocoder from '../../Search/GeocoderSearchContainer'
import InputField from '../../../components/InputField/index'
import SelectField from '../../../components/SelectField/index'
import TextAreaField from '../../../components/TextAreaField/index'
import UserInfo from './UserInfo'
import { validator } from '../../../common/formUtils'
import { mapDepotToApiParams } from '../../query'

const DepotForm = ({ handleSubmit, farms, user, error }) => {
  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>
      <fieldset>
        <legend>Name und Betrieb</legend>

        <Field
          name='name'
          label='Bezeichnung des Depots'
          component={InputField}
          type='text'
          maxLength='100'
          required
        />

        <Field
          name='url'
          label='Website'
          component={InputField}
          placeholder='http://beispiel.de'
          type='url'
          maxLength='100'
        />

        <Field
          name='farms'
          label='Gehört zu Betrieb'
          component={SelectField}
          options={farms}
          valueKey='id'
          labelKey='name'
          format={(value) => value || []}
          required
          multi
        />

        <p className='entries-editor-explanation'>
          Dein Betrieb fehlt auf der Liste?{' '}
          <Link to={NEW_FARM}>Neuen Betrieb eintragen</Link>
        </p>
      </fieldset>

      <fieldset className='geocoder'>
        <legend>Standort des Depots</legend>

        <Fields
          names={['city', 'address', 'latitude', 'longitude']}
          name='geocoder'
          label='Adresse und Ort'
          markerIcon='Depot'
          component={Geocoder}
          required
        />
      </fieldset>

      <fieldset>
        <legend>Details</legend>

        <Field
          name='description'
          label='Beschreibung des Depots'
          component={TextAreaField}
          maxLength='1000'
          placeholder='z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.'
          rows='8'
        />

        <Field
          name='deliveryDays'
          label='Abholtage'
          component={InputField}
          type='text'
          maxLength='100'
          placeholder='z.B. jeden zweiten Donnerstag'
        />
      </fieldset>

      <UserInfo user={user} />

      <div className='entries-editor-explanation'>
        <p>Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.</p>
        <button className='button submit' type='submit'>
          Speichern
        </button>
      </div>
    </form>
  )
}

DepotForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape().isRequired,
  farms: PropTypes.arrayOf(PropTypes.object).isRequired,
  error: PropTypes.string
}

DepotForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'depot',
  validate: (values) => validator('depot')(mapDepotToApiParams(values))
})(DepotForm)
