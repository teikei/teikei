import { Field, Fields, reduxForm, InjectedFormProps } from 'redux-form'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

import Geocoder from '../base//GeocoderSearchField'
import InputField from '../base/InputField'
import TextAreaField from '../base/TextAreaField'
import CheckboxGroup from '../base/CheckboxGroup'
import Badge from './Badge'
import UserInfo from './UserInfo'
import { validator } from '../../common/formUtils'
import { Product, User, Badge as BadgeType } from '../../types/types'

interface FarmFormProps extends InjectedFormProps {
  user: User
  products: Product[]
  badges: BadgeType[]
}

const FarmForm = ({
  handleSubmit,
  user,
  error = '',
  products,
  badges
}: FarmFormProps) => {
  const { t } = useTranslation()

  return (
    <form className='form-inputs' onSubmit={handleSubmit}>
      <strong>{error}</strong>

      <fieldset>
        <legend>{t('forms.farm.name_and_description')}</legend>

        <Field
          name='name'
          label={t('forms.farm.name')}
          component={InputField}
          type='text'
          maxLength='100'
          required
        />

        <Field
          name='url'
          label={t('forms.farm.url')}
          component={InputField}
          placeholder={t('forms.farm.url_placeholder')}
          type='url'
          maxLength='100'
        />

        <Field
          name='description'
          label={t('forms.farm.description')}
          component={TextAreaField}
          maxLength='1000'
          placeholder={t('forms.farm.description_placeholder')}
          rows={8}
        />

        <Fields
          names={['city', 'address', 'latitude', 'longitude']}
          name='geocoder'
          label={t('forms.farm.address')}
          markerIcon='Farm'
          component={Geocoder}
          required
        />
      </fieldset>

      <fieldset>
        <legend>{t('forms.farm.products')}</legend>
        {products &&
          _.uniq(products.map((allProducts) => allProducts.category)).map(
            (category) => (
              <div key={category}>
                <Field
                  name='products'
                  groupLabel={t(`productcategories.${category}`)}
                  component={CheckboxGroup}
                  options={products
                    .filter((p) => p.category === category)
                    .map((p) => ({
                      name: p.id,
                      label: t(`products.${p.name}`)
                    }))}
                />
              </div>
            )
          )}

        <Field
          name='additionalProductInformation'
          label={t('forms.farm.additional_info')}
          component={TextAreaField}
          maxLength='1000'
          placeholder={t('forms.farm.additional_info_placeholder')}
          rows={6}
        />
      </fieldset>

      <fieldset>
        <legend>{t('forms.farm.economic_behavior')}</legend>

        <Field
          name='actsEcological'
          label={t('forms.farm.acts_ecological')}
          component={InputField}
          type='checkbox'
        />

        <label htmlFor='economical_behavior'>
          {t('forms.farm.economical_behavior')}
        </label>
        <Field
          name='economicalBehavior'
          component='textarea'
          type='text'
          maxLength='1000'
          placeholder={t('forms.farm.economical_behavior_placeholder')}
          rows='6'
        />

        <label htmlFor='foundedAtYear'>{t('forms.farm.founded_year')}</label>
        <Field
          name='foundedAtYear'
          component='select'
          type='text'
          normalize={(v: string) => Number(v)}
        >
          {[<option key={0} />].concat(
            new Array(100)
              .fill(undefined)
              .reverse()
              .map((val: number, i) => {
                const year = new Date().getFullYear() - i
                return <option key={year}>{year}</option>
              })
          )}
        </Field>

        <label htmlFor='foundedAtMonth'>{t('forms.farm.founded_month')}</label>
        <Field
          name='foundedAtMonth'
          component='select'
          type='number'
          normalize={(v) => Number(v)}
        >
          <option key={0} value='' />
          <option key={1} value={1}>
            {t('months.january')}
          </option>
          <option key={2} value={2}>
            {t('months.february')}
          </option>
          <option key={3} value={3}>
            {t('months.march')}
          </option>
          <option key={4} value={4}>
            {t('months.april')}
          </option>
          <option key={5} value={5}>
            {t('months.may')}
          </option>
          <option key={6} value={6}>
            {t('months.june')}
          </option>
          <option key={7} value={7}>
            {t('months.july')}
          </option>
          <option key={8} value={8}>
            {t('months.august')}
          </option>
          <option key={9} value={9}>
            {t('months.september')}
          </option>
          <option key={10} value={10}>
            {t('months.october')}
          </option>
          <option key={11} value={11}>
            {t('months.november')}
          </option>
          <option key={12} value={12}>
            {t('months.december')}
          </option>
        </Field>
      </fieldset>

      <fieldset>
        <legend>{t('forms.farm.certifications')}</legend>
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

      <fieldset>
        <legend>{t('forms.farm.membership')}</legend>

        <label htmlFor='acceptsNewMembers'>
          {t('forms.farm.accepts_new_members')}
        </label>
        <ul className='form-checkbox-group' id='acceptsNewMembers'>
          <li>
            <Field
              name='acceptsNewMembers'
              value='yes'
              label={t('forms.farm.accepts_new_members_yes')}
              component={InputField}
              type='radio'
            />
          </li>
          <li>
            <Field
              name='acceptsNewMembers'
              value='no'
              label={t('forms.farm.accepts_new_members_no')}
              component={InputField}
              type='radio'
            />
          </li>
          <li>
            <Field
              name='acceptsNewMembers'
              value='waitlist'
              label={t('forms.farm.accepts_new_members_waitlist')}
              component={InputField}
              type='radio'
            />
          </li>
        </ul>

        <label htmlFor='maximumMembers'>
          {t('forms.farm.maximum_members')}
        </label>
        <Field
          name='maximumMembers'
          component='input'
          type='number'
          normalize={(v: string) => Number(v)}
        />
        <div className='entries-editor-explanation'>
          {t('forms.farm.maximum_members_how_many')}
        </div>

        <label htmlFor='participation'>{t('forms.farm.participation')}</label>
        <Field
          name='participation'
          component='textarea'
          type='text'
          maxLength='1000'
          rows='8'
        />
      </fieldset>

      <UserInfo user={user} />

      <div className='entries-editor-explanation'>
        <p>{t('forms.farm.required_info')}</p>
        <button className='button submit' type='submit'>
          {t('forms.farm.submit')}
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'farm',
  validate: validator('farm')
})(FarmForm)
