import React from "react";
import { Outlet } from "react-router-dom";

const LoginPage: React.FC = () => (
  <div className="container p-5">
    <div className="columns">
      <div className="column">
        <h1 className="title">Einträge hinzufügen und bearbeiten</h1>
        <p>
          Fehlen euer Betrieb, eure Abholstellen, oder eure neu gegründete
          Initiative auf der Karte? Kein Problem. Du kannst sie selbst
          eintragen.
        </p>
      </div>
      <div className="column">
        <Outlet />
      </div>
    </div>
  </div>
);

export default LoginPage;
