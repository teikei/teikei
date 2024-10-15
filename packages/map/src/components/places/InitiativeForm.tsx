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
        <p>
          Hier kannst Du eine Initiative erfassen, die noch im Aufbau ist, um
          Partner, Mitglieder, Land oder einen Betrieb zu finden.
        </p>

        <Field
          name='goals'
          groupLabel='Art der Initiative'
          component={CheckboxGroup}
          options={goals.map(({ id, name }) => ({
            name: id,
            label: t(`forms.labels.goals.${name}`)
          }))}
        />

        <Field
          name='description'
          label='Beschreibung der Initiative'
          component={TextAreaField}
          maxLength='1000'
          placeholder='z.B. Informationen zum Hintergrund oder zu gemeinsamen Aktivitäten.'
          rows={8}
        />
      </fieldset>
      <fieldset>
        <legend>Name</legend>

        <Field
          name='name'
          label='Bezeichnung der Initiative'
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
      </fieldset>

      <fieldset className='geocoder'>
        <legend>geplanter Standort der Initiative</legend>

        <Fields
          names={['city', 'address', 'latitude', 'longitude']}
          name='geocoder'
          label='Adresse und Ort'
          markerIcon='Initiative'
          component={Geocoder}
          required
        />
      </fieldset>

      <UserInfo user={user} />

      <fieldset>
        <legend>Verbände und Netzwerke</legend>
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
        <p>Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.</p>
        <button className='button submit' type='submit'>
          Speichern
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'initiative',
  validate: validator('initiative')
})(InitiativeForm)
