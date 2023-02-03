import React from "react";
import ReactDOM from "react-dom/client";
import MapPage, { mapPageLoader } from "./pages/MapPage/MapPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import LoginPage from "./pages/LoginPage/LoginPage";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginForm from "./pages/LoginPage/LoginForm";
import SignupForm from "./pages/LoginPage/SignupForm";
import RecoverPasswordForm from "./pages/LoginPage/RecoverPasswordForm";

export const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MapPage />} path="/" index loader={mapPageLoader} />
      <Route element={<LoginPage />} path="/users">
        <Route element={<LoginForm />} path="sign-in" />
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
