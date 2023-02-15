import { DetailedEntry, Entry, EntryType, User } from "../types";
import { FeatureCollection, Point } from "geojson";
import { z } from "zod";

export type GetEntryRequest = {
  type: EntryType;
  id: number;
};
export type GetEntryResponse = DetailedEntry;

export type FindEntriesResponse = FeatureCollection<Point, Entry>;

export const signInRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type SignInRequest = z.infer<typeof signInRequestSchema>;
export type SignInResponse = {
  accessToken: string;
  user: User;
};

export type SignOutResponse = void;

export const typeToService = (type: EntryType) => {
  const TYPE_TO_SERVICE_MAPPING = {
    Depot: "depots",
    Farm: "farms",
    Initiative: "initiatives",
  };
  const serviceName = TYPE_TO_SERVICE_MAPPING[type];
  if (serviceName === undefined) {
    throw new Error(`invalid type ${type} requested.`);
  }
  return serviceName;
};
