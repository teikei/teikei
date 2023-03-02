import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import AuthenticationPage from "./pages/AuthenticationPage";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { queryClient } from "./api/api";
import MapPage, { addEntryPageLoader, mapPageLoader } from "./pages/MapPage";
import SignInForm from "./components/account/SignInForm";
import SignUpForm from "./components/account/SignUpForm";
import RecoverPasswordForm from "./components/account/RecoverPasswordForm";
import AddDepotPage from "./pages/AddDepotPage";

import "./main.css";
import AddFarmPage from "./pages/AddFarmPage";
import AddInitiativePage from "./pages/AddInitiativePage";

import makeConfiguration from "./configuration";

export const useConfig = () => {
  const appContainerEl = document.getElementById("teikei-app");
  const searchContainerEl = document.getElementById("teikei-search");
  const configDataset: Record<string, any> = {
    ...(appContainerEl ? appContainerEl.dataset : {}),
    ...(searchContainerEl ? searchContainerEl.dataset : {}),
  };
  return useMemo(() => makeConfiguration(configDataset), []);
};

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
