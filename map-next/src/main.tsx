import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import {
  AuthenticationPage,
  MapPage,
  AddDepotPage,
  AddFarmPage,
  AddInitiativePage,
  addEntryPageLoader,
  mapPageLoader,
  MyEntriesPage,
  myEntriesLoader,
} from "@/pages";
import {
  SignInForm,
  SignUpForm,
  RecoverPasswordForm,
} from "@/components/account";
import { queryClient } from "@/clients";

import "./main.css";

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
