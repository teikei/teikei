import React from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../../search/GeocoderSearchContainer'
import InputField from '../../common/InputField'
import TextAreaField from '../../common/TextAreaField'
import UserInfo from './UserInfo'

const FarmForm = ({ handleSubmit, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">

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

    </fieldset>

    <fieldset className="geocoder">

      <legend>Standort des Betriebs</legend>

      <Field
        name="geocoder"
        label="Adresse und Ort"
        markerIcon="Depot"
        component={Geocoder}
        required
      />

    </fieldset>

    <fieldset>
      <legend>Solidarische Landwirtschaft seit</legend>
      <label htmlFor="founded_at_year">Jahr</label>
      <Field name="founded_at_year" component="select" type="text">
        {new Array(100)
          .fill(undefined)
          .reverse()
          // eslint-disable-next-line react/no-array-index-key
          .map((val, i) => <option key={i}>{new Date().getFullYear() - i}</option>)
        }
      </Field>

      <label htmlFor="founded_at_month">Monat</label>
      <Field name="founded_at_month" component="select" type="text">
        <option key={0} value=""/>
        <option key={1} value="1">Januar</option>
        <option key={2} value="2">Februar</option>
        <option key={3} value="3">März</option>
        <option key={4} value="4">April</option>
        <option key={5} value="5">Mai</option>
        <option key={6} value="6">Juni</option>
        <option key={7} value="7">Juli</option>
        <option key={8} value="8">August</option>
        <option key={9} value="9">September</option>
        <option key={10} value="10">Oktober</option>
        <option key={11} value="11">November</option>
        <option key={12} value="12">Dezember</option>
      </Field>

    </fieldset>

    <fieldset>
      <legend>Lebensmittelangebot</legend>

      <div>
        <label htmlFor="vegetable_products">Pflanzliche Produkte</label>
        <ul className="form-checkbox-group" id="vegetable_products" name="vegetable_products">
          <li>
            <Field
              name="vegetable_products__vegetables"
              label="Gemüse"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="vegetable_products__fruits"
              label="Obst"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="vegetable_products__mushrooms"
              label="Pilze"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="vegetable_products__cereals"
              label="Getreideprodukte (z.B. Mehl, Grieß, Nudeln)"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="vegetable_products__bread_and_pastries"
              label="Brot und Backwaren"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="vegetable_products__spices"
              label="Gewürze"
              component={InputField}
              type="checkbox"
            />
          </li>
        </ul>
      </div>

      <div>
        <label htmlFor="animal_products">Tierische Produkte</label>
        <ul className="form-checkbox-group" id="animal_products" name="animal_products">
          <li>
            <Field
              name="animal_products__eggs"
              label="Eier"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="animal_products__meat"
              label="Fleisch"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="animal_products__sausages"
              label="Wurstwaren"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="animal_products__milk"
              label="Milch"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="animal_products__dairy"
              label=" Milchprodukte (z.B. Butter, Käse, Joghurt)"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="animal_products__fish"
              label="Fisch"
              component={InputField}
              type="checkbox"
            />
            <Field
              name="animal_products__honey"
              label="Honig"
              component={InputField}
              type="checkbox"
            />
          </li>
        </ul>
      </div>

      <div>
        <label htmlFor="beverages">Getränke</label>
        <ul className="form-checkbox-group" id="beverages" name="beverages">
          <li>
            <Field
              name="beverages__juice"
              label="Saft"
              component={InputField}
              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="beverages__wine"
              label="Wein"
              component={InputField}

              type="checkbox"
            />
          </li>
          <li>
            <Field
              name="beverages__beer"
              label="Bier"
              component={InputField}
              type="checkbox"
            />
          </li>
        </ul>
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

      <label htmlFor="acts_ecological">Wir wirtschaften ökologisch</label>
      <input type="checkbox" name="acts_ecological" value="acts_ecological" id="acts_ecological"/>

      <label htmlFor="economical_behavior">Erläuterungen zur Wirtschaftsweise</label>
      <Field
        name="economical_behavior" component="textarea" type="text" maxLength="1000"
        placeholder="z.B. Mitgliedschaft in Anbauverbänden o.ä."
        rows="6"
      />
    </fieldset>

    <fieldset>

      <legend>Mitgliedschaft</legend>

      <label htmlFor="maximum_members">Habt ihr derzeit freie Plätze?</label>
      <ul className="form-checkbox-group" id="maximum_members" name="maximum_members">
        <li>
          <label htmlFor="accepts_new_members_yes">
            <input type="radio" name="accepts_new_members" value="yes" id="accepts_new_members_yes"/>
            Wir haben freie Plätze
          </label>
        </li>
        <li>
          <label htmlFor="accepts_new_members_no">
            <input type="radio" name="accepts_new_members" value="no" id="accepts_new_members_no"/>
            Wir haben keine freien Plätze
          </label>
        </li>
        <li>
          <label htmlFor="accepts_new_members_waitlist">
            <input type="radio" name="accepts_new_members" value="waitlist" id="accepts_new_members_waitlist"/>
            Wir haben keine freien Plätze, aber eine Warteliste
          </label>
        </li>
      </ul>

      <label htmlFor="maximum_members">Maximale Mitgliederzahl</label>
      <Field name="maximum_members" component="input" type="text" maxLength="100"/>
      <div className="entries-editor-explanation">
        Wieviele Esser kann der Betrieb versorgen?
      </div>

      <label htmlFor="participation">Wie können sich die Mitglieder einbringen?</label>
      <Field
        name="participation" component="textarea" type="text" maxLength="1000"
        rows="8"
      />
      <div className="entries-editor-explanation">
        Mitglieder helfen beispielsweise bei regelmäßigen Mitmachtagen auf dem Acker.
      </div>
    </fieldset>

    <UserInfo user={user}/>

    <div className="entries-editor-explanation">
      <p>
        Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.
      </p>
      <input type="submit" className="button submit" value="Speichern"/>
    </div>
  </form>
)

FarmForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  user: React.PropTypes.shape().isRequired,
};

export default reduxForm({ form: 'farm' })(FarmForm)
