import React from "react";
import { useForm } from "react-hook-form";
import { SignInRequest, signInRequestSchema } from "../../api/apiTypes";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod";

const RecoverPasswordForm: React.FC = () => {
  const methods = useForm<SignInRequest>({
    resolver: zodResolver(signInRequestSchema),
  });
  return (
    <>
      <h1 className="title">Passwort vergessen?</h1>
      <p>
        Trage hier deine Email-Adresse ein. Wir senden Dir dann eine Email, um
        Dein Passwort neu zu setzen.
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
        <div className="control">
          <button className="button is-link mt-2">Passwort zurücksetzen</button>
        </div>
      </form>
    </>
  );
};

export default RecoverPasswordForm;
