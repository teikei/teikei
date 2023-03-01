import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import Textarea from "./Textarea";

import "../../main.css";

export default {
  component: Textarea,
} as ComponentMeta<typeof Textarea>;

export const Default: ComponentStory<typeof Textarea> = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Textarea rows={6} id="value" label="Beschreibung" />
    </FormProvider>
  );
};
Default.storyName = "Submit Button";
