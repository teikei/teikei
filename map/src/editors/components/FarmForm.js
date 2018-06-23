import React from 'react'
import PropTypes from 'prop-types'
import { Field, Fields, reduxForm } from 'redux-form'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import CheckboxGroup from '../../common/CheckboxGroup'
import UserInfo from './UserInfo'
import { validator } from '../../common/formUtils'

const FarmForm = ({ handleSubmit, user, error }) => (
  <form className="form-inputs">
    <strong>{error}</strong>

    <fieldset>
      <legend>Name und Beschreibung des Betriebs</legend>

      <Field
        name="name"
        label="Name des Betriebs"
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

      <Field
        name="description"
        label="Beschreibung des Betriebs"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs."
        rows="8"
      />

      <Fields
        names={['city', 'address', 'latitude', 'longitude']}
        name="geocoder"
        label="Adresse und Ort"
        markerIcon="Farm"
        component={Geocoder}
        required
      />
    </fieldset>

    <fieldset>
      <legend>Lebensmittelangebot</legend>
      {/* TODO load products from API */}
      <div>
        <Field
          name="vegetable_products"
          groupLabel="Pflanzliche Produkte"
          component={CheckboxGroup}
          options={[
            {
              name: 'vegetables',
              label: 'Gemüse'
            },
            {
              name: 'fruits',
              label: 'Obst'
            },
            {
              name: 'mushrooms',
              label: 'Pilze'
            },
            {
              name: 'cereals',
              label: 'Getreideprodukte (z.B. Mehl, Grieß, Nudeln)'
            },
            {
              name: 'bread_and_pastries',
              label: 'Brot und Backwaren'
            },
            {
              name: 'spices',
              label: 'Kräuter'
            }
          ]}
        />
      </div>

      <div>
        <Field
          name="animal_products"
          groupLabel="Tierische Produkte"
          component={CheckboxGroup}
          options={[
            {
              name: 'eggs',
              label: 'Eier'
            },
            {
              name: 'meat',
              label: 'Fleisch'
            },
            {
              name: 'sausages',
              label: 'Wurstwaren'
            },
            {
              name: 'milk',
              label: 'Milch'
            },
            {
              name: 'dairy',
              label: 'Milchprodukte (z.B. Butter, Käse, Joghurt)'
            },
            {
              name: 'fish',
              label: 'Fisch'
            },
            {
              name: 'honey',
              label: 'Honig'
            }
          ]}
        />
      </div>

      <div>
        <Field
          name="beverages"
          groupLabel="Getränke"
          component={CheckboxGroup}
          options={[
            {
              name: 'juice',
              label: 'Saft'
            },
            {
              name: 'wine',
              label: 'Wein'
            },
            {
              name: 'beer',
              label: 'Bier'
            }
          ]}
        />
      </div>

      <Field
        name="additional_product_information"
        label="Zusätzliche Informationen zum Lebensmittelangebot"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä."
        rows="6"
      />
    </fieldset>

    <fieldset>
      <legend>Wirtschaftsweise</legend>

      <Field
        name="acts_ecological"
        label="Wir wirtschaften biologisch"
        component={InputField}
        type="checkbox"
      />

      <label htmlFor="economical_behavior">
        Erläuterungen zur Wirtschaftsweise
      </label>
      <Field
        name="economical_behavior"
        component="textarea"
        type="text"
        maxLength="1000"
        placeholder="z.B. Mitgliedschaft in Anbauverbänden o.ä."
        rows="6"
      />

      <label htmlFor="founded_at_year">Solawi seit (Jahr)</label>
      <Field name="founded_at_year" component="select" type="text">
        {new Array(100)
          .fill(undefined)
          .reverse()
          .map((val, i) => {
            const year = new Date().getFullYear() - i
            return <option key={year}>{year}</option>
          })}
      </Field>

      <label htmlFor="founded_at_month">Solawi seit (Monat)</label>
      <Field name="founded_at_month" component="select" type="text">
        <option key={0} value="" />
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
      <legend>Mitgliedschaft</legend>

      <label htmlFor="accepts_new_members">
        Habt ihr derzeit freie Plätze?
      </label>
      <ul
        className="form-checkbox-group"
        id="accepts_new_members"
        name="accepts_new_members"
      >
        <li>
          <Field
            name="accepts_new_members"
            value="yes"
            label="Wir haben freie Plätze"
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="accepts_new_members"
            value="no"
            label="Wir haben keine freien Plätze"
            component={InputField}
            type="radio"
          />
        </li>
        <li>
          <Field
            name="accepts_new_members"
            value="waitlist"
            label="Wir haben keine freien Plätze, aber eine Warteliste"
            component={InputField}
            type="radio"
          />
        </li>
      </ul>

      <label htmlFor="maximum_members">Maximale Mitgliederzahl</label>
      <Field
        name="maximum_members"
        component="input"
        type="text"
        maxLength="100"
      />
      <div className="entries-editor-explanation">
        Wieviele Esser kann der Betrieb versorgen?
      </div>

      <label htmlFor="participation">
        Wie können sich die Mitglieder einbringen?
      </label>
      <Field
        name="participation"
        component="textarea"
        type="text"
        maxLength="1000"
        rows="8"
      />
    </fieldset>

    <UserInfo user={user} />

    <div className="entries-editor-explanation">
      <p>Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.</p>
      <input
        type="button"
        className="button submit"
        value="Speichern"
        onClick={handleSubmit}
      />
    </div>
  </form>
)

FarmForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape().isRequired,
  error: PropTypes.string
}

FarmForm.defaultProps = {
  error: ''
}

export default reduxForm({
  form: 'farm',
  validate: validator('farm')
})(FarmForm)
