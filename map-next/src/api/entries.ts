import { FeatureCollection, Point } from "geojson";
import { z } from "zod";

import { DetailedEntry, EntryProperties, EntryType } from "@/types";
import { typeToService } from "@/common/apiHelpers";
import { client } from "@/clients";

export type FindEntriesRequest = {
  mine?: boolean;
};
export type FindEntriesResponse = FeatureCollection<Point, EntryProperties>;

export const findEntries = async (payload: FindEntriesRequest) => {
  return client.service("entries").find({
    query: payload,
  }) as Promise<FindEntriesResponse>;
};

export type GetEntryRequest = {
  type: EntryType;
  id: number;
};
export type GetEntryResponse = DetailedEntry;

// TODO use dedicated api endpoints instead (farm, depot...)?
export const getEntry = async ({ type, id }: GetEntryRequest) =>
  client.service(typeToService(type)).get(id) as Promise<GetEntryResponse>;

export const createDepotRequestSchema = z.object({
  name: z.string().min(1).default("foo"),
  url: z.string(),
  farms: z.array(z.any()),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(1), // TODO get rid of legacy field
  street: z.string().min(1),
  housenumber: z.string().optional(),
  postalcode: z.string().min(1),
  city: z.string().min(1),
  state: z.string(),
  country: z.string().min(1),
  description: z.string(),
  deliveryDays: z.string(),
});
export type CreateDepotRequest = z.infer<typeof createDepotRequestSchema>;
export type CreateDepotResponse = { name: string };

export const createDepot = async (payload: CreateDepotRequest) =>
  client.service("depots").create(payload) as Promise<CreateDepotResponse>;

export const createFarmRequestSchema = z.object({ name: z.string() });
export type CreateFarmRequest = z.infer<typeof createFarmRequestSchema>;
export type CreateFarmResponse = { name: string };

export const createFarm = async (payload: CreateFarmRequest) =>
  client.service("farms").create(payload) as Promise<CreateFarmResponse>;

export const createInitiativeRequestSchema = z.object({ name: z.string() });
export type CreateInitiativeRequest = z.infer<
  typeof createInitiativeRequestSchema
>;
export type CreateInitiativeResponse = { name: string };

export const createInitiative = async (payload: CreateInitiativeRequest) =>
  client
    .service("initiatives")
    .create(payload) as Promise<CreateInitiativeResponse>;
