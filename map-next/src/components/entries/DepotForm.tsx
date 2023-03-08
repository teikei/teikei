import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Depot, Entry, LocationSearchResult } from "@/types";
import { queryClient } from "@/clients";
import {
  createDepot,
  CreateDepotRequest,
  createDepotRequestSchema,
  findEntries,
  updateDepot,
} from "@/api";
import { authenticate } from "@/api/account";
import {
  Combobox,
  ComboboxOption,
  GeocoderInput,
  InputField,
  SubmitButton,
  Textarea,
} from "@/components/ui";

// TODO fetch async from server instead of filtering here (see ComboBox)
const maptoFarmOptionsList = (entries: Entry[]) =>
  entries
    .filter((e) => e.properties.type === "Farm")
    .map(
      (e) =>
        ({ id: e.properties.id, name: e.properties.name } as ComboboxOption)
    ) || [];

const getFormDefaultValues = (entry: Depot | undefined) =>
  entry === undefined
    ? { farms: [] }
    : {
        ...entry.properties,
        farms: entry.properties.farms.features.map((f) => f.properties.id),
        longitude: entry.geometry.coordinates[0],
        latitude: entry.geometry.coordinates[1],
      };

const getLocationSearchInitialValue = (
  entry: Depot | undefined
): LocationSearchResult | null => {
  if (entry === undefined) {
    return null;
  }
  const { street, postalcode, city, state } = entry.properties;
  return {
    street,
    // TODO housenumber
    // TODO typing mismatch entry api/geocoder
    // TDODO why doesn't LocationSearchResult include country?
    postalCode: postalcode,
    city,
    state,
  };
};

interface Props {
  entry?: Depot;
}

export const DepotForm: React.FC<Props> = ({ entry }) => {
  const methods = useForm<CreateDepotRequest>({
    resolver: (values, context, options) =>
      zodResolver(createDepotRequestSchema)(values, context, options),
    defaultValues: getFormDefaultValues(entry),
  });
  const { handleSubmit } = methods;

  const navigate = useNavigate();
  const refreshAndNavigateBackToMap = () => {
    queryClient.invalidateQueries("places");
    navigate("/");
  };
  const createMutation = useMutation(createDepot, {
    onSuccess: () => {
      refreshAndNavigateBackToMap();
    },
  });
  const updateMutation = useMutation(updateDepot, {
    onSuccess: () => {
      refreshAndNavigateBackToMap();
    },
  });

  const { data, isSuccess: isUserSuccess } = useQuery(
    ["authenticate"],
    authenticate
  );
  const user = (isUserSuccess && data && data.user) || {};

  const { data: placesData, isSuccess: isPlacesSuccess } = useQuery(
    ["places"],
    () => findEntries({}),
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
      <form
        onSubmit={handleSubmit((formData) => {
          if (entry === undefined) {
            createMutation.mutate(formData);
          } else {
            updateMutation.mutate({ id: entry.properties.id, ...formData });
          }
        })}
      >
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
        <GeocoderInput
          entryType="Depot"
          initialValue={getLocationSearchInitialValue(entry)}
        />
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
    </FormProvider>
  );
};
