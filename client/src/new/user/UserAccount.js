import React from 'react'

// TODO implement, use redux form? 

const UserAccount = ({ user }) => (
  <div className="details-view open" style={{ top: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
    <div className="container">
      <h2>Benutzerkonto anpassen</h2>
      <form className="edit_user" id="edit_user" action="/users" acceptCharset="UTF-8" method="post">
        <fieldset>
          <div className="form-inputs">
            <div>
              <label htmlFor="user_name">Name</label>
              <input type="text" value="Production Superadmin" name="user[name]" id="user_name" />
            </div>
            <div>
              <label htmlFor="user_email">E-Mail-Adresse</label>
              <input type="email" value="admin@teikei.com" name="user[email]" id="user_email" />
            </div>
            <div>
              <label htmlFor="user_phone">Telefon</label>
              <input type="text" value="" name="user[phone]" id="user_phone" />
            </div>
            <div>
              <label htmlFor="user_password">Passwort</label>
              <input autoComplete="off" type="password" name="user[password]" id="user_password" />
              <p className="form-explanation">
                (Freilassen, wenn das Passwort nicht geändert werden soll)
              </p>
            </div>
            <div>
              <label htmlFor="user_password_confirmation">Passwort-Wiederholung</label>
              <input type="password" name="user[password_confirmation]" id="user_password_confirmation" />
            </div>
            <div>
              <label htmlFor="user_current_password">Aktuelles Passwort</label>
              <input type="password" name="user[current_password]" id="user_current_password" />
              <p className="form-explanation">
                (Wir benötigen das aktuelle Passwort, um die Änderung zu bestätigen)
              </p>
            </div>
          </div>
          <div className="form-actions">
            <input type="submit" name="commit" value="Absenden" className="button" />
          </div>
        </fieldset>
      </form>
    </div>
  </div>
)

export default UserAccount
