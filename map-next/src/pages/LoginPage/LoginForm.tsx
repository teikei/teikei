import React from "react";

const LoginForm: React.FC = () => (
  <>
    <h1 className="title">Anmeldung für registrierte Nutzerinnen und Nutzer</h1>
    <p>
      Neu hier? <a href="sign-up">Hier kannst du dich registrieren.</a>
    </p>
    <form>
      <div className="field mt-5">
        <label className="label">Email-Adresse</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Email-Adresse eingeben"
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
      <div className="field mt-5 is-flex">
        <div className="control">
          <button className="button is-link ">Anmelden</button>
        </div>
        <div className="control is-flex is-align-items-center ml-2">
          <a className="is-link" href="recoverpassword">
            Passwort vergessen?
          </a>
        </div>
      </div>
    </form>
  </>
);

export default LoginForm;
