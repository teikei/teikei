import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";
import { QueryClient } from "react-query";

import {
  AutocompleteRequest,
  AutocompleteResponse,
  CreateDepotRequest,
  CreateDepotResponse,
  CreateFarmRequest,
  CreateFarmResponse,
  CreateInitiativeRequest,
  CreateInitiativeResponse,
  FindEntriesResponse,
  GeocodeRequest,
  GetEntryRequest,
  GetEntryResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  typeToService,
} from "@/api/apiTypes";

const client = createFeathersClient();
// TODO read from configuration (fix initialization order)
const restClient = rest("http://localhost:3030");

client.configure(restClient.fetch(window.fetch.bind(window)));
client.configure(
  authentication({
    storage: window.localStorage,
  })
);
export const queryClient = new QueryClient();

export const signIn = async (payload: SignInRequest) =>
  client.authenticate({
    ...payload,
    strategy: "local",
  }) as Promise<SignInResponse>;

// TODO send baseurl from config in request payload
export const signUp = async (payload: SignUpRequest) =>
  client.service("users").create({
    ...payload,
    baseurl: "TODO",
  }) as Promise<SignUpResponse>;

// reauthenticate logged in user
export const authenticate = () =>
  client
    .authenticate()
    // don't throw when user is not logged in, just report state
    .catch(() => ({
      accessToken: null,
      user: null,
    }));

export const signOut = async () => client.logout();

export const findEntries = async () =>
  client.service("entries").find() as Promise<FindEntriesResponse>;

// TODO use dedicated api endpoints instead (farm, depot...)?
export const getEntry = async ({ type, id }: GetEntryRequest) =>
  client.service(typeToService(type)).get(id) as Promise<GetEntryResponse>;

export const createDepot = async (payload: CreateDepotRequest) =>
  client.service("depots").create(payload) as Promise<CreateDepotResponse>;

export const createFarm = async (payload: CreateFarmRequest) =>
  client.service("farms").create(payload) as Promise<CreateFarmResponse>;

export const createInitiative = async (payload: CreateInitiativeRequest) =>
  client
    .service("initiatives")
    .create(payload) as Promise<CreateInitiativeResponse>;

export const autocomplete = async ({
  text,
  withEntries,
}: AutocompleteRequest) =>
  client
    .service("autocomplete")
    .create({ text, query: { withEntries } }) as Promise<AutocompleteResponse>;

export const geocode = async (payload: GeocodeRequest) =>
  client.service("geocoder").create(payload);
