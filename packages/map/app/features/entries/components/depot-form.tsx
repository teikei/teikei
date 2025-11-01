import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Field, Fields, reduxForm } from 'redux-form'
import type { InjectedFormProps } from 'redux-form'
import { mapDepotToApiParams } from '~/api/map-depot-to-api-params'
import Geocoder from '~/components/ds/form/geocoder-search-field'
import InputField from '~/components/ds/form/input-field'
import SelectField from '~/components/ds/form/select-field'
import TextAreaField from '~/components/ds/form/text-area-field'
import UserInfo from '~/features/entries/components/user-info'
import { NEW_FARM } from '~/lib/routes'
import type { FarmSelectOption, User } from '~/types/types'
import { validator } from '~/utils/form-utils'

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

export default reduxForm<any, DepotFormProps>({
  form: 'depot',
  validate: (values) => validator('depot')(mapDepotToApiParams(values))
})(DepotForm)
