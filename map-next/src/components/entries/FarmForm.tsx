import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Depot } from "@/types";
import {
  authenticate,
  createFarm,
  CreateFarmRequest,
  createFarmRequestSchema,
} from "@/api";
import {
  Checkbox,
  GeocoderInput,
  InputField,
  RadioGroupInput,
  SubmitButton,
  MonthPicker,
  Textarea,
} from "@/components/ui";
import { getLocationSearchInitialValue } from "@/common/formHelpers";

const membershipOptions = [
  {
    label: "Wir haben freie Plätze",
    value: "yes",
  },
  {
    label: "Wir haben keine freien Plätze",
    value: "no",
  },
  {
    label: "Wir haben keine freien Plätze, aber eine Warteliste",
    value: "waitlist",
  },
];

interface Props {
  entry?: Depot;
}

export const FarmForm: React.FC<Props> = ({ entry }) => {
  const methods = useForm<CreateFarmRequest>({
    resolver: zodResolver(createFarmRequestSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const mutation = useMutation(createFarm, {
    onSuccess: () => {
      navigate("/");
    },
  });
  const { data } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
        <h3>Name und Beschreibung des Betriebs</h3>
        <InputField name="name" label="Bezeichnung des Betriebs" />
        <InputField name="url" label="Website" />
        <Textarea
          id="description"
          label="Beschreibung des Betriebs"
          rows={4}
          placeholder="z.B. Informationen zum Hintergrund, zu den BetreiberInnen oder zur Geschichte des Betriebs."
        />
        <h3>Standort des Betriebs</h3>
        <GeocoderInput
          entryType="Farm"
          initialValue={getLocationSearchInitialValue(entry)}
        />
        <h3>Lebensmittelangebot</h3>
        <Textarea
          id="description"
          label="Zusätzliche Informationen zum Lebensmittelangebot"
          rows={4}
          placeholder="z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä."
        />
        <h3>Wirtschaftsweise</h3>
        <Checkbox
          name="economical_behavior"
          label="Wir wirtschaften biologisch"
        />
        <Textarea
          id="description"
          label="Erläuterungen zur Wirtschaftsweise"
          rows={4}
          placeholder="z.B. Mitgliedschaft in Anbauverbänden o.ä."
        />
        <h3>Solawi seit</h3>
        <MonthPicker
          monthFieldName="foundedAtMonth"
          yearFieldName="foundedAtYear"
        />
        <h3>Verbände und Netzwerke</h3>
        {/*TODO Badges select checkboxes*/}
        <InputField name="badges" label="Mitgliedschaften" />
        <h3>Solawi-Mitgliedschaft</h3>
        <RadioGroupInput
          name="membership"
          label="Habt ihr derzeit freie Plätze?"
          options={membershipOptions}
        />
        <InputField
          name="maximum_members"
          label="Maximale Mitgliederzahl"
          type="number"
        />
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
    </FormProvider>
  );
};
