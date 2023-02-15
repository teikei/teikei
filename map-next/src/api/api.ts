import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";
import { QueryClient } from "react-query";
import {
  FindEntriesResponse,
  GetEntryRequest,
  GetEntryResponse,
  SignInRequest,
  SignInResponse,
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

export const findEntries = async () =>
  client.service("entries").find() as Promise<FindEntriesResponse>;

export const getEntry = async ({ type, id }: GetEntryRequest) =>
  client.service(typeToService(type)).get(id) as Promise<GetEntryResponse>;

export const signIn = async ({ email, password }: SignInRequest) =>
  client.authenticate({
    email,
    password,
    strategy: "local",
  }) as Promise<SignInResponse>;

// reauthenticate logged in user
export const authenticate = async () =>
  client.authenticate() as Promise<SignInResponse>;
