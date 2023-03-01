import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { authenticate, createFarm } from "../../api/api";
import {
  CreateFarmRequest,
  createFarmRequestSchema,
  CreateFarmResponse,
} from "../../api/apiTypes";
import InputField from "../ui/InputField";
import SubmitButton from "../ui/SubmitButton";
import Textarea from "../ui/Textarea";

const FarmForm: React.FC = () => {
  const methods = useForm<CreateFarmRequest>({
    resolver: zodResolver(createFarmRequestSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(createFarm, {
    onSuccess: (data: CreateFarmResponse) => {
      navigate("/");
    },
  });
  const { data } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};
  return (
    <FormProvider {...methods}>
      <div className="prose">
        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <h3>Name und Beschreibung des Betriebs</h3>
          <InputField id="name" label="Bezeichnung des Betriebs" />
          <InputField id="url" label="Website" />
          <Textarea
            id="description"
            label="Beschreibung des Betriebs"
            rows={4}
            placeholder="z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs."
          />
          <h3>Standort des Betriebs</h3>
          {/*TODO Geocoder*/}
          <InputField id="latitude_longitude" label="Adresse und Ort" />
          <h3>Lebensmittelangebot</h3>
          <Textarea
            id="description"
            label="Zusätzliche Informationen zum Lebensmittelangebot"
            rows={4}
            placeholder="z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä."
          />
          <h3>Wirtschaftsweise</h3>
          {/*TODO checkbox*/}
          <InputField
            id="economical_behavior"
            label="Wir wirtschaften biologisch"
          />
          <Textarea
            id="description"
            label="Erläuterungen zur Wirtschaftsweise"
            rows={4}
            placeholder="z.B. Mitgliedschaft in Anbauverbänden o.ä."
          />
          {/*TODO Selectfield (date picker?)*/}
          <InputField id="foundedAtYear" label="Solawi seit (Jahr)" />
          <InputField id="foundedAtYear" label="Solawi seit (Monat)" />
          <h3>Verbände und Netzwerke</h3>
          {/*TODO Badges select checkboxes*/}
          <InputField id="badges" label="Mitgliedschaften" />
          <h3>Solawi-Mitgliedschaft</h3>
          {/*TODO Radiofield*/}
          <InputField id="membership" label="Habt ihr derzeit freie Plätze?" />
          {/*TODO numeric input*/}
          <InputField id="maximum_members" label="Maximale Mitgliederzahl" />
          <Textarea
            id="description"
            label="Wie können sich die Mitglieder einbringen?"
            rows={4}
          />
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

export default FarmForm;
