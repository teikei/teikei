import React from 'react'
import { Field, reduxForm } from 'redux-form'
import Geocoder from '../search/GeocoderSearchContainer'
import InputField from '../common/InputField'
import TextAreaField from '../common/TextAreaField'
import UserInfo from './UserInfo'

const FarmForm = ({ handleSubmit, user }) => (
  <form onSubmit={handleSubmit} className="form-inputs">

    <fieldset>

      <legend>Name und Standort des Betriebs</legend>

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
        name="geocoder"
        label="Adresse und Ort"
        markerIcon="Depot"
        component={Geocoder}
        required
      />

    </fieldset>

    <fieldset>
      <legend>Lebensmittelangebot</legend>
      <label htmlFor="founded_at_year">Solidarische Landwirtschaft seit bzw. ab (Jahr)</label>
      <Field name="founded_at_year" component="select" type="text">
        {new Array(100)
          .fill(undefined)
          .reverse()
          .map((val, i) => <option>{new Date().getFullYear() - i}</option>)
        }
      </Field>

      <label htmlFor="founded_at_month">Solidarische Landwirtschaft seit bzw. ab (Monat)</label>
      <Field name="founded_at_month" component="select" type="text">
        <option value="" />
        <option value="1">Januar</option>
        <option value="2">Februar</option>
        <option value="3">März</option>
        <option value="4">April</option>
        <option value="5">Mai</option>
        <option value="6">Juni</option>
        <option value="7">Juli</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">Oktober</option>
        <option value="11">November</option>
        <option value="12">Dezember</option>
      </Field>

      <Field
        name="description"
        label="Beschreibung des Betriebs"
        component={TextAreaField}
        maxLength="1000"
        placeholder="z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs."
        rows="8"
      />

    </fieldset>

    <fieldset>
      <legend>Lebensmittelangebot</legend>

      <div className="data-block checkboxes">
        <label htmlFor="vegetable_products">Pflanzliche Produkte</label>
        <ul id="vegetable_products" name="vegetable_products">
          <li>
            <label htmlFor="vegetables">
              <input type="checkbox" name="vegetable_products" value="vegetables" id="vegetables" />
              Gemüse
            </label>
          </li>
          <li>
            <label htmlFor="fruits">
              <input type="checkbox" name="vegetable_products" value="fruits" id="fruits" />
              Obst
            </label>
          </li>
          <li>
            <label htmlFor="mushrooms">
              <input type="checkbox" name="vegetable_products" value="mushrooms" id="mushrooms" />
              Pilze
            </label>
          </li>
          <li>
            <label htmlFor="cereals">
              <input type="checkbox" name="vegetable_products" value="cereals" id="cereals" />
              Getreideprodukte (z.B. Mehl, Grieß, Nudeln)
            </label>
          </li>
          <li>
            <label htmlFor="bread_and_pastries">
              <input type="checkbox" name="vegetable_products" value="bread_and_pastries" id="bread_and_pastries" />
              Brot undBackwaren
            </label>
          </li>
          <li>
            <label htmlFor="spices">
              <input type="checkbox" name="vegetable_products" value="spices" id="spices" />
              Gewürze
            </label>
          </li>
        </ul>
      </div>

      <div className="data-block checkboxes">
        <label htmlFor="animal_products">Tierische Produkte</label>
        <ul id="animal_products" name="animal_products">
          <li>
            <label htmlFor="eggs">
              <input type="checkbox" name="animal_products" value="eggs" id="eggs" />
              Eier
            </label>
          </li>
          <li>
            <label htmlFor="meat">
              <input type="checkbox" name="animal_products" value="meat" id="meat" />
              Fleisch
            </label>
          </li>
          <li>
            <label htmlFor="sausages">
              <input type="checkbox" name="animal_products" value="sausages" id="sausages" />
              Wurstwaren
            </label>
          </li>
          <li>
            <label htmlFor="milk">
              <input type="checkbox" name="animal_products" value="milk" id="milk" />
              Milch
            </label>
          </li>
          <li>
            <label htmlFor="dairy">
              <input type="checkbox" name="animal_products" value="dairy" id="dairy" />
              Milchprodukte (z.B. Butter, Käse, Joghurt)
            </label>
          </li>
          <li>
            <label htmlFor="fish">
              <input type="checkbox" name="animal_products" value="fish" id="fish" />
              Fisch
            </label>
            <label htmlFor="honey">
              <input type="checkbox" name="animal_products" value="honey" id="honey" />
              Honig
            </label>
          </li>
        </ul>
      </div>

      <div className="data-block checkboxes">
        <label htmlFor="beverages">Getränke</label>
        <ul id="beverages" name="beverages">
          <li>
            <label htmlFor="juice">
              <input type="checkbox" name="beverages" value="juice" id="juice" />
              Saft
            </label>
          </li>
          <li>
            <label htmlFor="wine">
              <input type="checkbox" name="beverages" value="wine" id="wine" />
              Wein
            </label>
          </li>
          <li>
            <label htmlFor="beer">
              <input type="checkbox" name="beverages" value="beer" id="beer" />
              Bier
            </label>
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

      <div className="data-block checkboxes">
        <label htmlFor="acts_ecological">Wir wirtschaften ökologisch</label>
        <input type="checkbox" name="acts_ecological" value="acts_ecological" id="acts_ecological" />
      </div>
      <label htmlFor="economical_behavior">Erläuterungen zur Wirtschaftsweise</label>
      <Field
        name="economical_behavior" component="textarea" type="text" maxLength="1000"
        placeholder="z.B. Mitgliedschaft in Anbauverbänden o.ä."
        rows="6"
      />
    </fieldset>

    <fieldset>

      <legend>Mitgliedschaft</legend>

      <div className="data-block radios">
        <label htmlFor="maximum_members">Getränke</label>
        <ul id="maximum_members" name="maximum_members">
          <li>
            <label htmlFor="accepts_new_members_yes">
              <input type="radio" name="accepts_new_members" value="yes" id="accepts_new_members_yes" />
              Wir haben freie Plätze
            </label>
          </li>
          <li>
            <label htmlFor="accepts_new_members_no">
              <input type="radio" name="accepts_new_members" value="no" id="accepts_new_members_no" />
              Wir haben keine freien Plätze
            </label>
          </li>
          <li>
            <label htmlFor="accepts_new_members_waitlist">
              <input type="radio" name="accepts_new_members" value="waitlist" id="accepts_new_members_waitlist" />
              Wir haben keine freien Plätze, aber eine Warteliste
            </label>
          </li>
        </ul>
      </div>

      <label htmlFor="maximum_members">Maximale Mitgliederzahl</label>
      <Field name="maximum_members" component="input" type="text" maxLength="100" />
      <div className="entries-editor-explanation">
        Wieviele Esser kann der Betrieb versorgen?
      </div>

    </fieldset>

    <fieldset>
      <label htmlFor="participation">Wie können sich die Mitglieder aktiv einbringen?</label>
      <Field
        name="participation" component="textarea" type="text" maxLength="1000"
        rows="8"
      />
      <div className="entries-editor-explanation">
        Mitglieder helfen beispielsweise bei regelmäßigen Mitmachtagen auf dem Acker.
      </div>
    </fieldset>

    <UserInfo user={user} />

    <div className="entries-editor-explanation">
      <p>
        Mit einem * gekennzeichneten Felder müssen ausgefüllt werden.
      </p>
      <input type="submit" className="button submit" value="Speichern" />
    </div>
  </form>
)

FarmForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  user: React.PropTypes.shape().isRequired,
};

export default reduxForm({ form: 'farm' })(FarmForm)
