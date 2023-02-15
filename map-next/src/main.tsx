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
import MapPage, { mapPageLoader } from "./pages/MapPage/MapPage";
import SignInForm from "./components/account/SignInForm/SignInForm";
import SignUpForm from "./components/account/SignUpForm/SignUpForm";
import RecoverPasswordForm from "./components/account/RecoverPasswordForm/RecoverPasswordForm";
import AddDepotPage from "./pages/AddDepotPage/AddDepotPage";

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
      <Route element={<AddDepotPage />} path="/depots/new" />
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
