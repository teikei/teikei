import { Field, Fields, reduxForm, InjectedFormProps } from 'redux-form'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

import Geocoder from '../base/GeocoderSearchField'
import InputField from '../base/InputField'
import TextAreaField from '../base/TextAreaField'
import CheckboxGroup from '../base/CheckboxGroup'
import UserInfo from './UserInfo'
import { validator } from '../../common/formUtils'
import Badge from './Badge'
import { User, Badge as BadgeType, Goal } from '../../types/types'

interface InitiativeFormProps extends InjectedFormProps {
  user: User
  goals: Goal[]
  badges: BadgeType[]
}

const InitiativeForm = ({
  handleSubmit,
  user,
  error = '',
  goals,
  badges
}: InitiativeFormProps) => {
  const { t } = useTranslation()
  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>
      <fieldset>
        <p>{t('forms.initiative.intro_text')}</p>

        <Field
          name='goals'
          groupLabel={t('forms.initiative.type')}
          component={CheckboxGroup}
          options={goals.map(({ id, name }) => ({
            name: id,
            label: t(`forms.labels.goals.${name}`)
          }))}
        />

        <Field
          name='description'
          label={t('forms.initiative.description')}
          component={TextAreaField}
          maxLength='1000'
          placeholder={t('forms.initiative.description_placeholder')}
          rows={8}
        />
      </fieldset>
      <fieldset>
        <legend>{t('forms.initiative.name_title')}</legend>

        <Field
          name='name'
          label={t('forms.initiative.name')}
          component={InputField}
          type='text'
          maxLength='100'
          required
        />

        <Field
          name='url'
          label={t('forms.initiative.url')}
          component={InputField}
          placeholder='http://beispiel.de'
          type='url'
          maxLength='100'
        />
      </fieldset>

      <fieldset className='geocoder'>
        <legend>{t('forms.initiative.planned_location')}</legend>

        <Fields
          names={['city', 'address', 'latitude', 'longitude']}
          name='geocoder'
          label={t('forms.initiative.address')}
          markerIcon='Initiative'
          component={Geocoder}
          required
        />
      </fieldset>

      <UserInfo user={user} />

      <fieldset>
        <legend>{t('forms.initiative.certifications')}</legend>
        {badges &&
          _.uniq(badges.map((allBadges) => allBadges.category)).map(
            (category) => (
              <div key={category}>
                <Field
                  name='badges'
                  groupLabel={t(`badgescategories.${category}`)}
                  component={CheckboxGroup}
                  options={badges
                    .filter((b) => b.category === category)
                    .map((b) => ({
                      name: b.id,
                      label: <Badge logoUrl={b.logo} url={b.url} />
                    }))}
                />
              </div>
            )
          )}
      </fieldset>

      <div className='entries-editor-explanation'>
        <p>{t('forms.initiative.required_info')}</p>
        <button className='button submit' type='submit'>
          {t('forms.initiative.submit')}
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'initiative',
  validate: validator('initiative')
})(InitiativeForm)
