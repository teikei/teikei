import { Field, Fields, reduxForm, InjectedFormProps } from 'redux-form'
import { Link } from 'react-router-dom'

import { NEW_FARM } from '../../routes'
import Geocoder from '../base/GeocoderSearchField'
import InputField from '../base/InputField'
import SelectField from '../base/SelectField'
import TextAreaField from '../base/TextAreaField'
import UserInfo from './UserInfo'
import { validator } from '../../common/formUtils'
import { mapDepotToApiParams } from '../../queries/places.api'
import { FarmSelectOption, User } from '../../types/types'

interface DepotFormProps extends InjectedFormProps {
  farms: FarmSelectOption[]
  user: User
}

const DepotForm = ({
  handleSubmit,
  farms,
  user,
  error = ''
}: DepotFormProps) => {
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
          format={(value: FarmSelectOption) => value || []}
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
          rows={8}
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

export default reduxForm({
  form: 'depot',
  validate: (values) => validator('depot')(mapDepotToApiParams(values))
})(DepotForm)
