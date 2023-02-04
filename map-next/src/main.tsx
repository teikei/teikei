import React from "react";
import ReactDOM from "react-dom/client";
import MapPage, { mapPageLoader } from "./pages/MapPage/MapPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import AuthenticationPage from "./pages/AuthenticationPage/AuthenticationPage";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import SignInForm from "./pages/AuthenticationPage/SignInForm";
import SignupForm from "./pages/AuthenticationPage/SignupForm";
import RecoverPasswordForm from "./pages/AuthenticationPage/RecoverPasswordForm";

export const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MapPage />} path="/" index loader={mapPageLoader} />
      <Route element={<AuthenticationPage />} path="/users">
        <Route element={<SignInForm />} path="sign-in" />
        <Route element={<SignupForm />} path="sign-up" />
        <Route element={<RecoverPasswordForm />} path="recoverpassword" />
      </Route>
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
