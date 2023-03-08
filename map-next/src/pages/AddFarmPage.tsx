import React from "react";

import { FarmForm } from "@/components/entries";

export const AddFarmPage: React.FC = () => (
  <div className="prose p-5">
    <h1>Neuen Betrieb eintragen</h1>
    <FarmForm />
  </div>
);
