import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import SubmitButton from "./SubmitButton";

import "../../main.css";

export default {
  component: SubmitButton,
} as ComponentMeta<typeof SubmitButton>;

export const Default: ComponentStory<typeof SubmitButton> = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <SubmitButton text="Speichern" />
    </FormProvider>
  );
};
Default.storyName = "Submit Button";
