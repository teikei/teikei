import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";
import { EntryType, User } from "./types";

export interface SignInRequest {
  email: string;
  password: string;
}
export interface SignInResponse {
  accessToken: string;
  user: User;
}

const TYPE_TO_SERVICE_MAPPING = {
  Depot: "depots",
  Farm: "farms",
  Initiative: "initiatives",
};

const typeToService = (type: EntryType) => {
  const serviceName = TYPE_TO_SERVICE_MAPPING[type];
  if (serviceName === undefined) {
    throw new Error(`invalid type ${type} requested.`);
  }
  return serviceName;
};

const client = createFeathersClient();
const restClient = rest("http://localhost:3030");
client.configure(restClient.fetch(window.fetch.bind(window)));
client.configure(
  authentication({
    storage: window.localStorage,
  })
);

export const findEntries = async () => client.service("entries").find();

export const getEntry = async (type: EntryType | null, id: number | null) => {
  if (type === null || id === null) {
    return null;
  }
  return client.service(typeToService(type)).get(id);
};

export const signIn = async ({ email, password }: SignInRequest) =>
  client.authenticate({
    email,
    password,
    strategy: "local",
  }) as Promise<SignInResponse>;

export const authenticate = async () =>
  client.authenticate() as Promise<SignInResponse>;
