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

import { queryClient } from "@/clients";
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
  EditDepotPage,
  editDepotPageLoader,
  EditFarmPage,
  EditInitiativePage,
  editFarmPageLoader,
  editInitiativePageLoader,
} from "@/pages";
import {
  SignInForm,
  SignUpForm,
  RecoverPasswordForm,
} from "@/components/account";

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
      <Route path="/depots">
        <Route
          element={<AddDepotPage />}
          path="new"
          loader={addEntryPageLoader}
        />
        <Route
          element={<EditDepotPage />}
          path=":id/edit"
          loader={editDepotPageLoader}
        />
      </Route>
      <Route path="/farms">
        <Route
          element={<AddFarmPage />}
          path="new"
          loader={addEntryPageLoader}
        />
        <Route
          element={<EditFarmPage />}
          path=":id/edit"
          loader={editFarmPageLoader}
        />
      </Route>
      <Route path="/initiatives">
        <Route
          element={<AddInitiativePage />}
          path="new"
          loader={addEntryPageLoader}
        />
        <Route
          element={<EditInitiativePage />}
          path=":id/edit"
          loader={editInitiativePageLoader}
        />
      </Route>
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
