import { QueryClient } from "react-query";
import makeConfiguration from "@/configuration";
import { useMemo } from "react";
import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";

export const queryClient = new QueryClient();

const appContainerEl = document.getElementById("teikei-app");
const searchContainerEl = document.getElementById("teikei-search");
const configDataset: Record<string, any> = {
  ...(appContainerEl ? appContainerEl.dataset : {}),
  ...(searchContainerEl ? searchContainerEl.dataset : {}),
};

const config = makeConfiguration(configDataset);

export const useConfig = () => {
  return useMemo(() => config, []);
};

export const client = createFeathersClient();
const restClient = rest(config.apiBaseUrl);

client.configure(restClient.fetch(window.fetch.bind(window)));
// TODO fix typescript error
client.configure(
  authentication({
    storage: window.localStorage,
  })
);
