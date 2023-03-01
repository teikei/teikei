import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { authenticate, createDepot } from "../../../api/api";
import {
  CreateDepotRequest,
  createDepotRequestSchema,
  CreateDepotResponse,
} from "../../../api/apiTypes";
import InputField from "../../ui/InputField";
import SubmitButton from "../../ui/SubmitButton";
import Textarea from "../../ui/Textarea";
import MultiSelect from "../../ui/MultiSelect";
import Combobox from "../../ui/Combobox";

const DepotForm: React.FC = () => {
  const methods = useForm<CreateDepotRequest>({
    resolver: zodResolver(createDepotRequestSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(createDepot, {
    onSuccess: (data: CreateDepotResponse) => {
      navigate("/");
    },
  });
  const { data } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};
  return (
    <FormProvider {...methods}>
      <div className="prose">
        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <h3>Name und Betrieb</h3>
          <InputField id="name" label="Bezeichnung des Depots" />
          <InputField id="url" label="Website" />
          {/*TODO: Combobox*/}
          <Combobox
            id="farms"
            label="Gehört zu Betrieb"
            placeholder="Betrieb hinzufügen..."
          />
          {/*<MultiSelect />*/}
          <p>
            Dein Betrieb fehlt auf der Liste?{" "}
            <a href="/farms/new">Neuen Betrieb eintragen</a>
          </p>
          <h3>Standort der Abholstelle</h3>
          {/*TODO Geocoder*/}
          <InputField id="latitude_longitude" label="Adresse und Ort" />
          <h3>Details</h3>
          <Textarea id="description" label="Beschreibung des Depots" rows={4} />
          <InputField id="deliveryDays" label="Abholtage" />
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

export default DepotForm;
