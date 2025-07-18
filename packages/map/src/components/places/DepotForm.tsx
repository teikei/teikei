import { NEW_FARM } from '@/routes'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Field, Fields, InjectedFormProps, reduxForm } from 'redux-form'

import { validator } from '@/common/formUtils'
import Geocoder from '@/components/base/GeocoderSearchField'
import InputField from '@/components/base/InputField'
import SelectField from '@/components/base/SelectField'
import TextAreaField from '@/components/base/TextAreaField'
import UserInfo from '@/components/places/UserInfo'
import { mapDepotToApiParams } from '@/queries/places.api'
import { FarmSelectOption, User } from '@/types/types'

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
  const { t } = useTranslation()
  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>
      <fieldset>
        <legend>{t('forms.depot.name')}</legend>

        <Field
          name='name'
          label={t('forms.depot.description')}
          component={InputField}
          type='text'
          maxLength='100'
          required
        />

        <Field
          name='url'
          label={t('forms.depot.url')}
          component={InputField}
          placeholder={t('forms.depot.url_placeholder')}
          type='url'
          maxLength='100'
        />

        <Field
          name='farms'
          label={t('forms.depot.belongs_to_farm')}
          component={SelectField}
          options={farms}
          valueKey='id'
          labelKey='name'
          format={(value: FarmSelectOption) => value || []}
          required
          multi
        />

        <p className='entries-editor-explanation'>
          {t('forms.depot.missing_farm')}{' '}
          <Link to={NEW_FARM}>{t('forms.depot.add_new_farm')}</Link>
        </p>
      </fieldset>

      <fieldset className='geocoder'>
        <legend>{t('forms.depot.location')}</legend>

        <Fields
          names={['city', 'address', 'latitude', 'longitude']}
          name='geocoder'
          label={t('forms.depot.address')}
          markerIcon='Depot'
          component={Geocoder}
          required
        />
      </fieldset>

      <fieldset>
        <legend>{t('forms.depot.details')}</legend>

        <Field
          name='description'
          label={t('forms.depot.description')}
          component={TextAreaField}
          maxLength='1000'
          placeholder={t('forms.depot.description_placeholder')}
          rows={8}
        />

        <Field
          name='deliveryDays'
          label={t('forms.depot.deliverydays')}
          component={InputField}
          type='text'
          maxLength='100'
          placeholder={t('forms.depot.deliverydays_placeholder')}
        />
      </fieldset>

      <UserInfo user={user} />

      <div className='entries-editor-explanation'>
        <p>{t('forms.depot.required_info')}</p>
        <button className='button submit' type='submit'>
          {t('forms.depot.submit')}
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'depot',
  validate: (values) => validator('depot')(mapDepotToApiParams(values))
})(DepotForm)
