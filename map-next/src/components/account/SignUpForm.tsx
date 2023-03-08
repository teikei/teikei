import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod";

import {
  signUp,
  SignUpRequest,
  signUpRequestSchema,
  SignUpResponse,
} from "@/api/account";
import { InputField, SubmitButton } from "@/components/ui";

const SignUpForm: React.FC = () => {
  const methods = useForm<SignUpRequest>({
    resolver: zodResolver(signUpRequestSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(signUp, {
    onSuccess: (data: SignUpResponse) => {
      navigate("/");
    },
    onError: (e: Error) => {
      console.log("e", e);

      setError(
        "root",
        { type: "server", message: e.message },
        { shouldFocus: true }
      );
    },
  });
  return (
    <FormProvider {...methods}>
      <div className="prose">
        <h1>Registrierung für neue Nutzerinnen und Nutzer</h1>
        <p>
          Du bist bereits registriert?{" "}
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="sign-in"
          >
            Hier kannst du dich anmelden.
          </a>
        </p>
        {errors.root && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errors.root.message as string}
          </p>
        )}

        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <InputField id="name" label="Vorname und Nachname" type="text" />
          <InputField id="phone" label="Telefonnummer (optional)" type="text" />
          <InputField id="email" label="Email-Adresse" type="email" />
          <InputField id="password" label="Passwort" type="password" />
          <InputField
            id="passwordConfirmation"
            label="Passwort bestätigen"
            type="password"
          />

          <p>
            Mit deiner Registrierung akzeptierst du die Nutzungsbedingungen und
            Datenschutzerklärung von ernte-teilen.org, das diese Plattform zur
            Verfügung stellt:{" "}
            <a
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              href="/nutzungsbedingungen/"
            >
              Nutzungsbedingungen/Datenschutz
            </a>
          </p>
          <SubmitButton text="Anmelden" />
        </form>
      </div>
    </FormProvider>
  );
};

export default SignUpForm;
