import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { Field, Fields, reduxForm } from 'redux-form'
import type { InjectedFormProps } from 'redux-form'
import CheckboxGroup from '~/components/ds/form/checkbox-group'
import Geocoder from '~/components/ds/form/geocoder-search-field'
import InputField from '~/components/ds/form/input-field'
import TextAreaField from '~/components/ds/form/text-area-field'
import Badge from '~/features/entries/components/badge'
import UserInfo from '~/features/entries/components/user-info'
import type { Badge as BadgeType, Product, User } from '~/types/types'
import { validator } from '~/utils/form-utils'
import { monthNameKeys } from '~/utils/i18n-utils'

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
          {monthNameKeys.map((month, i) => (
            <option key={i + 1} value={i + 1}>
              {t(month)}
            </option>
          ))}
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
                      label: (
                        <Badge name={b.name} logoUrl={b.logo} url={b.url} />
                      )
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
            <label>
              <Field
                name='acceptsNewMembers'
                value='yes'
                component='input'
                type='radio'
              />
              {t('forms.farm.accepts_new_members_yes')}
            </label>
          </li>
          <li>
            <label>
              <Field
                name='acceptsNewMembers'
                value='no'
                component='input'
                type='radio'
              />
              {t('forms.farm.accepts_new_members_no')}
            </label>
          </li>
          <li>
            <label>
              <Field
                name='acceptsNewMembers'
                value='waitlist'
                component='input'
                type='radio'
              />
              {t('forms.farm.accepts_new_members_waitlist')}
            </label>
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
