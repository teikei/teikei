import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import AuthenticationPage from "./pages/AuthenticationPage/AuthenticationPage";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { queryClient } from "./api/api";
import MapPage, {
  addDepotPageLoader,
  addEntryPageLoader,
  addFarmPageLoader,
  mapPageLoader,
} from "./pages/MapPage/MapPage";
import SignInForm from "./components/account/SignInForm/SignInForm";
import SignUpForm from "./components/account/SignUpForm/SignUpForm";
import RecoverPasswordForm from "./components/account/RecoverPasswordForm/RecoverPasswordForm";
import AddDepotPage from "./pages/AddDepotPage/AddDepotPage";

import "./main.css";
import AddFarmPage from "./pages/AddFarmPage/AddFarmPage";
import AddInitiativePage from "./pages/AddInitiativePage/AddInitiativePage";

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
