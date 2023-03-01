import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";
import { QueryClient } from "react-query";
import {
  CreateDepotRequest,
  CreateDepotResponse,
  CreateFarmRequest,
  CreateFarmResponse,
  CreateInitiativeRequest,
  CreateInitiativeResponse,
  FindEntriesResponse,
  GetEntryRequest,
  GetEntryResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  typeToService,
} from "./apiTypes";

const client = createFeathersClient();
const restClient = rest("http://localhost:3030");

client.configure(restClient.fetch(window.fetch.bind(window)));
client.configure(
  authentication({
    storage: window.localStorage,
  })
);
export const queryClient = new QueryClient();

export const signIn = async ({ email, password }: SignInRequest) =>
  client.authenticate({
    email,
    password,
    strategy: "local",
  }) as Promise<SignInResponse>;

// TODO send baseurl from config in request payload
export const signUp = async ({ name, phone, email, password }: SignUpRequest) =>
  client.service("users").create({
    name,
    phone,
    email,
    password,
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

export const getEntry = async ({ type, id }: GetEntryRequest) =>
  client.service(typeToService(type)).get(id) as Promise<GetEntryResponse>;

export const createDepot = async ({}: CreateDepotRequest) =>
  client.service("depots").create() as Promise<CreateDepotResponse>;

export const createFarm = async ({}: CreateFarmRequest) =>
  client.service("farms").create() as Promise<CreateFarmResponse>;

export const createInitiative = async ({}: CreateInitiativeRequest) =>
  client.service("initiatives").create() as Promise<CreateInitiativeResponse>;
