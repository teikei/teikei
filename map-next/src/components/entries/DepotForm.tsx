import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { authenticate, createDepot, findEntries } from "../../api/api";
import {
  CreateDepotRequest,
  createDepotRequestSchema,
  CreateDepotResponse,
} from "../../api/apiTypes";
import { Entry } from "../../types";
import InputField from "../ui/InputField";
import SubmitButton from "../ui/SubmitButton";
import Textarea from "../ui/Textarea";
import Combobox, { ComboboxOption } from "../ui/Combobox";
import GeocoderInput from "../ui/GeocoderInput";

// TODO fetch async from server instead of filtering here (see ComboBox)
const maptoFarmOptionsList = (entries: Entry[]) =>
  entries
    .filter((e) => e.properties.type === "Farm")
    .map(
      (e) =>
        ({ id: e.properties.id, name: e.properties.name } as ComboboxOption)
    ) || [];

const DepotForm: React.FC = () => {
  const methods = useForm<CreateDepotRequest>({
    resolver: (values, context, options) =>
      zodResolver(createDepotRequestSchema)(values, context, options),
    defaultValues: {
      farms: [],
      name: "Foo",
      latitude_longitude: "Foo",
    },
  });
  const { handleSubmit } = methods;

  const navigate = useNavigate();
  const mutation = useMutation(createDepot, {
    onSuccess: (data: CreateDepotResponse) => {
      navigate("/");
    },
  });

  const { data, isSuccess: isUserSuccess } = useQuery(
    ["authenticate"],
    authenticate
  );
  const user = (isUserSuccess && data && data.user) || {};

  const { data: placesData, isSuccess: isPlacesSuccess } = useQuery(
    ["places"],
    findEntries,
    {
      staleTime: 10000,
    }
  );
  const farms =
    (isPlacesSuccess &&
      maptoFarmOptionsList(placesData?.features as Entry[])) ||
    [];

  return (
    <FormProvider {...methods}>
      <div className="prose">
        <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
          <h3>Name und Betrieb</h3>
          <InputField id="name" label="Bezeichnung des Depots" />
          <InputField id="url" label="Website" />
          <Combobox
            id="farms"
            label="Gehört zu Betrieb"
            placeholder="Betrieb hinzufügen..."
            options={farms}
          />
          <p>
            Dein Betrieb fehlt auf der Liste?{" "}
            <a href="/farms/new">Neuen Betrieb eintragen</a>
          </p>
          <h3>Standort der Abholstelle</h3>
          {/*TODO Geocoder*/}
          <GeocoderInput />
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
