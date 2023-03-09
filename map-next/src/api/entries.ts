import { FeatureCollection, Point } from "geojson";
import { z } from "zod";

import { DetailedEntry, EntryProperties, EntryType } from "@/types";
import { typeToService } from "@/common/apiHelpers";
import { client } from "@/clients";

// find entries
export type FindEntriesRequest = {
  mine?: boolean;
};
export type FindEntriesResponse = FeatureCollection<Point, EntryProperties>;
export const findEntries = async (payload: FindEntriesRequest) => {
  return client.service("entries").find({
    query: payload,
  }) as Promise<FindEntriesResponse>;
};

// get entry
export type GetEntryRequest = {
  type: EntryType;
  id: number;
};
export type GetEntryResponse = DetailedEntry;
// TODO use dedicated api endpoints instead (farm, depot...)?
export const getEntry = async ({ type, id }: GetEntryRequest) =>
  client.service(typeToService(type)).get(id) as Promise<GetEntryResponse>;

// delete entry
export type DeleteEntryRequest = {
  type: EntryType;
  id: number;
};
export type DeleteEntryResponse = DetailedEntry;
// TODO use dedicated api endpoints instead (farm, depot...)?
export const deleteEntry = async ({ type, id }: DeleteEntryRequest) =>
  client
    .service(typeToService(type))
    .remove(id) as Promise<DeleteEntryResponse>;

// create depot
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

// update depot
type UpdateDepotRequest = CreateDepotRequest & { id: number };
export const updateDepot = async (payload: UpdateDepotRequest) =>
  client
    .service("depots")
    .patch(payload.id, payload) as Promise<CreateDepotResponse>;

// get depot
export const getDepot = async (id: number) => client.service("depots").get(id);

// create farm
export const createFarmRequestSchema = z.object({ name: z.string() });
export type CreateFarmRequest = z.infer<typeof createFarmRequestSchema>;
export type CreateFarmResponse = { name: string };
export const createFarm = async (payload: CreateFarmRequest) =>
  client.service("farms").create(payload) as Promise<CreateFarmResponse>;

// create initiative
export const createInitiativeRequestSchema = z.object({ name: z.string() });
export type CreateInitiativeRequest = z.infer<
  typeof createInitiativeRequestSchema
>;
export type CreateInitiativeResponse = { name: string };
export const createInitiative = async (payload: CreateInitiativeRequest) =>
  client
    .service("initiatives")
    .create(payload) as Promise<CreateInitiativeResponse>;
