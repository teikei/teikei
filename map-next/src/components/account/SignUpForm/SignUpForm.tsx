import React from "react";

const SignUpForm: React.FC = () => (
  <>
    <h1 className="title">Registrierung für neue Nutzerinnen und Nutzer</h1>
    <p>
      Du bist bereits registriert?{" "}
      <a href="sign-in">Hier kannst du dich anmelden.</a>
    </p>
    <form>
      <div className="field mt-5">
        <label className="label">Vorname und Nachname</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Email-Adresse eingeben"
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Telefonnummer (optional)</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Passwort eingeben"
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Email-Adresse</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Passwort eingeben"
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Passwort</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Passwort eingeben"
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Passwort bestätigen</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Passwort eingeben"
          />
        </div>
      </div>
      <p>
        Mit deiner Registrierung akzeptierst du die Nutzungsbedingungen und
        Datenschutzerklärung von ernte-teilen.org, das diese Plattform zur
        Verfügung stellt:{" "}
        <a href="/nutzungsbedingungen/">Nutzungsbedingungen/Datenschutz</a>
      </p>
      <div className="control">
        <button className="button is-link mt-5">Anmelden</button>
      </div>
    </form>
  </>
);

export default SignUpForm;
