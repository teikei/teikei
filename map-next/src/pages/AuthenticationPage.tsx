import React from "react";
import { Outlet } from "react-router-dom";

const AuthenticationPage: React.FC = () => (
  <div className="flex p-5 flex-col md:flex-row">
    <div className="flex-1 prose px-2">
      <h1>Einträge hinzufügen und bearbeiten</h1>
      <p>
        Fehlen euer Betrieb, eure Abholstellen, oder eure neu gegründete
        Initiative auf der Karte? Kein Problem. Du kannst sie selbst eintragen.
      </p>
    </div>
    <div className="flex-1 px-2">
      <Outlet />
    </div>
  </div>
);

export default AuthenticationPage;
