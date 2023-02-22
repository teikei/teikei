import React from "react";
import { FormProvider, useForm } from "react-hook-form";
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
import InputField from "../../ui/InputField";
import SubmitButton from "../../ui/SubmitButton";

const SignInForm: React.FC = () => {
  const methods = useForm<SignInRequest>({
    resolver: zodResolver(signInRequestSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(signIn, {
    onSuccess: (data: SignInResponse) => {
      navigate("/");
    },
  });
  return (
    <FormProvider {...methods}>
      <h1 className="title">
        Anmeldung für registrierte Nutzerinnen und Nutzer
      </h1>
      <p>
        Neu hier? <a href="sign-up">Hier kannst du dich registrieren.</a>
      </p>
      <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
        <InputField
          id="email"
          placeholder="Email-Adresse eingeben"
          type="email"
        />
        <InputField
          id="password"
          placeholder="Passwort eingeben"
          type="password"
        />
        <SubmitButton text="Anmelden" />
        <div className="mb-5">
          <a
            href="recoverpassword"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            Passwort vergessen?
          </a>
        </div>
      </form>
    </FormProvider>
  );
};

export default SignInForm;
