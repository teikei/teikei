import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Initiative } from "@/types";
import {
  authenticate,
  createInitiative,
  CreateInitiativeRequest,
  createInitiativeRequestSchema,
  CreateInitiativeResponse,
} from "@/api";
import {
  GeocoderInput,
  InputField,
  RadioGroupInput,
  SubmitButton,
  Textarea,
} from "@/components/ui";
import { getLocationSearchInitialValue } from "@/common/formHelpers";

// TODO load from /goals API?
const initiativeGoalOptions = [
  { value: "land", label: " Wir suchen Land oder Hof" },
  { value: "staff", label: "Wir suchen GärtnerInnen oder LandwirtInnen" },
  {
    value: "organizers",
    label: "  Wir suchen Mitglieder für unser Organisationsteam",
  },
  { value: "consumers", label: "  Wir suchen KonsumentInnen" },
];

interface Props {
  entry?: Initiative;
}

export const InitiativeForm: React.FC<Props> = ({ entry }) => {
  const methods = useForm<CreateInitiativeRequest>({
    resolver: zodResolver(createInitiativeRequestSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(createInitiative, {
    onSuccess: (data: CreateInitiativeResponse) => {
      navigate("/");
    },
  });
  const { data } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};
  return (
    <FormProvider {...methods}>
      <div className="prose">
        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <h3>Name</h3>
          <InputField name="name" label="Bezeichnung des Depots" />
          <InputField name="url" label="Website" />
          <h3>geplanter Standort der Initiative</h3>
          <GeocoderInput
            entryType="Initiative"
            initialValue={getLocationSearchInitialValue(entry)}
          />
          <h3>Details</h3>
          {/*TODO goals select*/}
          <InputField name="goals" label="Art der Initiative" />
          <Textarea
            id="description"
            label="Beschreibung der Initiative"
            rows={4}
          />
          <h3>Verbände und Netzwerke</h3>
          {/*TODO Badges select checkboxes*/}
          <InputField name="badges" label="Mitgliedschaften" />
          <h3>Kontaktdaten</h3>
          <p>Deine Kontakt-Email-Adresse: {user.email}</p>
          <a href="/users/editAccount" className="block pb-2">
            Kontaktdaten ändern
          </a>
          <SubmitButton text="Speichern" />
        </form>
      </div>
    </FormProvider>
  );
};
