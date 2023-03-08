import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  authenticate,
  createInitiative,
  CreateInitiativeRequest,
  createInitiativeRequestSchema,
  CreateInitiativeResponse,
} from "@/api";
import { InputField, SubmitButton, Textarea } from "@/components/ui";

export const InitiativeForm: React.FC = () => {
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
          <InputField id="name" label="Bezeichnung des Depots" />
          <InputField id="url" label="Website" />
          <h3>geplanter Standort der Initiative</h3>
          {/*TODO Geocoder*/}
          <InputField id="latitude_longitude" label="Adresse und Ort" />
          <h3>Details</h3>
          {/*TODO radiofields*/}
          <InputField id="goals" label="Art der Initiative" />
          <Textarea
            id="description"
            label="Beschreibung der Initiative"
            rows={4}
          />
          <h3>Verbände und Netzwerke</h3>
          {/*TODO Badges select checkboxes*/}
          <InputField id="badges" label="Mitgliedschaften" />
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
