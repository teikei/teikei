import { DetailedEntry, EntryProperties, EntryType, User } from "../types";
import { FeatureCollection, Point } from "geojson";
import { z } from "zod";

export const signInRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type SignInRequest = z.infer<typeof signInRequestSchema>;
export type SignInResponse = {
  accessToken: string;
  user: User;
};

export const signUpRequestSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().min(1),
    password: z.string().min(1),
    passwordConfirmation: z.string().min(1),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "The passwords did not match",
      });
    }
  });
export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type SignUpResponse = {
  id: string;
  email: string;
  name: string;
  phone: string;
  isVerified: false;
  createdAt: string;
  updatedAt: string;
  adminEmailNotifications: boolean;
  lastLogin: string;
  type: "User";
  link: string;
};

export type FindEntriesResponse = FeatureCollection<Point, EntryProperties>;

export type GetEntryRequest = {
  type: EntryType;
  id: number;
};
export type GetEntryResponse = DetailedEntry;

export const createDepotRequestSchema = z.object({ name: z.string() });
export type CreateDepotRequest = z.infer<typeof createDepotRequestSchema>;
export type CreateDepotResponse = { name: string };

export const createFarmRequestSchema = z.object({ name: z.string() });
export type CreateFarmRequest = z.infer<typeof createFarmRequestSchema>;
export type CreateFarmResponse = { name: string };

export const createInitiativeRequestSchema = z.object({ name: z.string() });
export type CreateInitiativeRequest = z.infer<
  typeof createInitiativeRequestSchema
>;
export type CreateInitiativeResponse = { name: string };

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
