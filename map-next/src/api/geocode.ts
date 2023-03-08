import { z } from "zod";

import { LocationSearchResult } from "@/types";
import { client } from "@/main";

export const autocompleteRequestSchema = z.object({
  text: z.string().min(1),
  withEntries: z.boolean().default(false),
});

export type AutocompleteRequest = z.infer<typeof autocompleteRequestSchema>;
export type AutocompleteResponse = LocationSearchResult[];

export const autocomplete = async ({
  text,
  withEntries,
}: AutocompleteRequest) =>
  client
    .service("autocomplete")
    .create({ text, query: { withEntries } }) as Promise<AutocompleteResponse>;

export type GeocodeRequest = {
  locationid: string;
};
export type GeocodeResponse = {
  city: string;
  country: string;
  id: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  state: string;
  street: string;
  housenumber: string;
};

export const geocode = async (payload: GeocodeRequest) =>
  client.service("geocoder").create(payload) as Promise<GeocodeResponse>;
