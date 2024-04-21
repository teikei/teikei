import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Field, Fields, reduxForm } from 'redux-form'
import _ from 'lodash'

import Geocoder from '../../Search/GeocoderSearchContainer'
import InputField from '../../../components/InputField/index'
import TextAreaField from '../../../components/TextAreaField/index'
import CheckboxGroup from '../../../components/CheckboxGroup/index'
import UserInfo from './UserInfo'
import { validator } from '../../../common/formUtils'
import i18n from '../../../i18n'
import Badge from './Badge'

class FarmForm extends Component {
  componentDidMount() {
    this.props.clearSearch()
  }

  render() {
    const { handleSubmit, user, error, products, badges } = this.props
    return (
      <form className='form-inputs'>
        <strong>{error}</strong>

        <fieldset>
          <legend>Name und Beschreibung des Betriebs</legend>

          <Field
            name='name'
            label='Name des Betriebs'
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
            name='description'
            label='Beschreibung des Betriebs'
            component={TextAreaField}
            maxLength='1000'
            placeholder='z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs.'
            rows='8'
          />

          <Fields
            names={['city', 'address', 'latitude', 'longitude']}
            name='geocoder'
            label='Adresse und Ort'
            markerIcon='Farm'
            component={Geocoder}
            required
          />
        </fieldset>

        <fieldset>
          <legend>Lebensmittelangebot</legend>
          {products &&
            _.uniq(products.map((allProducts) => allProducts.category)).map(
              (category) => (
                <div key={category}>
                  <Field
                    name='products'
                    groupLabel={i18n.t(`productcategories.${category}`)}
                    component={CheckboxGroup}
                    options={products
                      .filter((p) => p.category === category)
                      .map((p) => ({
                        name: p.id,
                        label: i18n.t(`products.${p.name}`)
                      }))}
                  />
                </div>
              )
            )}

          <Field
            name='additionalProductInformation'
            label='Zusätzliche Informationen zum Lebensmittelangebot'
            component={TextAreaField}
            maxLength='1000'
            placeholder='z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä.'
            rows='6'
          />
        </fieldset>

        <fieldset>
          <legend>Wirtschaftsweise</legend>

          <Field
            name='actsEcological'
            label='Dieser Betrieb ist bio-zertifiziert'
            component={InputField}
            type='checkbox'
          />

          <label htmlFor='economical_behavior'>
            Erläuterungen zur Wirtschaftsweise
          </label>
          <Field
            name='economicalBehavior'
            component='textarea'
            type='text'
            maxLength='1000'
            placeholder='z.B. Mitgliedschaft in Anbauverbänden o.ä.'
            rows='6'
          />

          <label htmlFor='foundedAtYear'>Solawi seit (Jahr)</label>
          <Field
            name='foundedAtYear'
            component='select'
            type='text'
            normalize={(v) => Number(v)}
          >
            {[<option key={0} />].concat(
              new Array(100)
                .fill(undefined)
                .reverse()
                .map((val, i) => {
                  const year = new Date().getFullYear() - i
                  return <option key={year}>{year}</option>
                })
            )}
          </Field>

          <label htmlFor='foundedAtMonth'>Solawi seit (Monat)</label>
          <Field
            name='foundedAtMonth'
            component='select'
            type='number'
            normalize={(v) => Number(v)}
          >
            <option key={0} value='' />
            <option key={1} value={1}>
              Januar
            </option>
            <option key={2} value={2}>
              Februar
            </option>
            <option key={3} value={3}>
              März
            </option>
            <option key={4} value={4}>
              April
            </option>
            <option key={5} value={5}>
              Mai
            </option>
            <option key={6} value={6}>
              Juni
            </option>
            <option key={7} value={7}>
              Juli
            </option>
            <option key={8} value={8}>
              August
            </option>
            <option key={9} value={9}>
              September
            </option>
            <option key={10} value={10}>
              Oktober
            </option>
            <option key={11} value={11}>
              November
            </option>
            <option key={12} value={12}>
              Dezember
            </option>
          </Field>
        </fieldset>

        <fieldset>
          <legend>Verbände und Netzwerke</legend>
          {badges &&
            _.uniq(badges.map((allBadges) => allBadges.category)).map(
              (category) => (
                <div key={category}>
                  <Field
                    name='badges'
                    groupLabel={i18n.t(`badgescategories.${category}`)}
                    component={CheckboxGroup}
                    options={badges
                      .filter((b) => b.category === category)
                      .map((b) => ({
                        name: b.id,
                        label: (
                          <Badge logoUrl={b.logo} name={b.name} url={b.url} />
                        )
                      }))}
                  />
                </div>
              )
            )}
        </fieldset>

        <fieldset>
          <legend>Solawi-Mitgliedschaft</legend>

          <label htmlFor='acceptsNewMembers'>
            Habt ihr derzeit freie Plätze?
          </label>
          <ul
            className='form-checkbox-group'
            id='acceptsNewMembers'
            name='acceptsNewMembers'
          >
            <li>
              <Field
                name='acceptsNewMembers'
                value='yes'
                label='Wir haben freie Plätze'
                component={InputField}
                type='radio'
              />
            </li>
            <li>
              <Field
                name='acceptsNewMembers'
                value='no'
                label='Wir haben keine freien Plätze'
                component={InputField}
                type='radio'
              />
            </li>
            <li>
              <Field
                name='acceptsNewMembers'
                value='waitlist'
                label='Wir haben keine freien Plätze, aber eine Warteliste'
                component={InputField}
                type='radio'
              />
            </li>
          </ul>

          <label htmlFor='maximumMembers'>Maximale Mitgliederzahl</label>
          <Field
            name='maximumMembers'
            component='input'
            type='number'
            normalize={(v) => Number(v)}
          />
          <div className='entries-editor-explanation'>
            Wieviele Esser kann der Betrieb versorgen?
          </div>

          <label htmlFor='participation'>
            Wie können sich die Mitglieder einbringen?
          </label>
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
          <p>Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.</p>
          <input
            type='button'
            className='button submit'
            value='Speichern'
            onClick={handleSubmit}
          />
        </div>
      </form>
    )
  }
}

FarmForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  user: PropTypes.shape().isRequired,
  error: PropTypes.string,
  products: PropTypes.array.isRequired,
  badges: PropTypes.array.isRequired
}

FarmForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'farm',
  validate: validator('farm')
})(FarmForm)
