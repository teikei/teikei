import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { signIn } from "@/api/api";
import {
  SignInRequest,
  signInRequestSchema,
  SignInResponse,
} from "@/api/apiTypes";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";

const SignInForm: React.FC = () => {
  const methods = useForm<SignInRequest>({
    resolver: zodResolver(signInRequestSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(signIn, {
    onSuccess: (data: SignInResponse) => {
      navigate("/");
    },
  });
  return (
    <FormProvider {...methods}>
      <div className="prose">
        <h1 className="title">
          Anmeldung für registrierte Nutzerinnen und Nutzer
        </h1>
        <p>
          Neu hier?{" "}
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="sign-up"
          >
            Hier kannst du dich registrieren.
          </a>
        </p>
        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <InputField id="email" label="Email-Adresse" type="email" />
          <InputField id="password" label="Passwort" type="password" />
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
      </div>
    </FormProvider>
  );
};

export default SignInForm;
