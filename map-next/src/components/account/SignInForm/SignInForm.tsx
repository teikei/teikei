import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { signIn } from "../../../api/api";
import classNames from "classnames";
import {
  SignInRequest,
  signInRequestSchema,
  SignInResponse,
} from "../../../api/apiTypes";

const SignInForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInRequestSchema),
  });
  const navigate = useNavigate();
  const mutation = useMutation(signIn, {
    onSuccess: (data: SignInResponse) => {
      navigate("/");
    },
  });
  return (
    <>
      <h1 className="title">
        Anmeldung für registrierte Nutzerinnen und Nutzer
      </h1>
      <p>
        Neu hier? <a href="sign-up">Hier kannst du dich registrieren.</a>
      </p>
      <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
        <div className="field mt-5">
          <label className="label">Email-Adresse</label>
          <div className="control">
            <input
              className={classNames("input", { "is-danger": errors.email })}
              type="text"
              placeholder="Email-Adresse eingeben"
              {...register("email")}
            />
            {errors.email && (
              <p className="help is-danger">{errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="field">
          <label className="label">Passwort</label>
          <div className="control">
            <input
              className={classNames("input", { "is-danger": errors.password })}
              type="text"
              placeholder="Passwort eingeben"
              {...register("password")}
            />
            {errors.password && (
              <p className="help is-danger">{errors.password.message}</p>
            )}
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
};

export default SignInForm;
