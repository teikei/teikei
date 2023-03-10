import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { InputField } from "@/components/ui";

import "@/main.css";

export default {
  component: InputField,
} as ComponentMeta<typeof InputField>;

export const Default: ComponentStory<typeof InputField> = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <InputField name="value" label="Email-Adresse" />
    </FormProvider>
  );
};
Default.storyName = "Text Input";

export const Password: ComponentStory<typeof InputField> = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <InputField name="value" label="Passwort" type="password" />
    </FormProvider>
  );
};
Password.storyName = "Password";
