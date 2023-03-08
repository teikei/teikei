import React from "react";

import { InitiativeForm } from "@/components/entries";

export const AddInitiativePage: React.FC = () => (
  <div className="prose p-5">
    <h1>Neue Initiative eintragen</h1>
    <p>
      Hier kannst Du eine Initiative erfassen, die noch im Aufbau ist, um
      Partner, Mitglieder, Land oder einen Betrieb zu finden.
    </p>
    <InitiativeForm />
  </div>
);
