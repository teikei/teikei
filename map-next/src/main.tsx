import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";

import AuthenticationPage from "@/pages/AuthenticationPage";
import makeConfiguration from "@/configuration";
import MapPage, { addEntryPageLoader, mapPageLoader } from "@/pages/MapPage";
import AddDepotPage from "@/pages/AddDepotPage";
import AddFarmPage from "@/pages/AddFarmPage";
import AddInitiativePage from "@/pages/AddInitiativePage";
import SignInForm from "@/components/account/SignInForm";
import SignUpForm from "@/components/account/SignUpForm";
import RecoverPasswordForm from "@/components/account/RecoverPasswordForm";

import MyEntriesPage, { myEntriesLoader } from "@/pages/MyEntriesPage";

import "./main.css";

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
client.configure(
  authentication({
    storage: window.localStorage,
  })
);

export const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MapPage />} path="/" index loader={mapPageLoader} />
      <Route element={<AuthenticationPage />} path="/users">
        <Route element={<SignInForm />} path="sign-in" />
        <Route element={<SignUpForm />} path="sign-up" />
        <Route element={<RecoverPasswordForm />} path="recoverpassword" />
      </Route>
      <Route
        element={<AddDepotPage />}
        path="/depots/new"
        loader={addEntryPageLoader}
      />
      <Route
        element={<AddFarmPage />}
        path="/farms/new"
        loader={addEntryPageLoader}
      />
      <Route
        element={<AddInitiativePage />}
        path="/initiatives/new"
        loader={addEntryPageLoader}
      />
      <Route
        element={<MyEntriesPage />}
        path="/myentries"
        loader={myEntriesLoader}
      />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
