import React from "react";

import { FarmForm } from "@/components/entries";

export const AddFarmPage: React.FC = () => (
  <div className="p-5">
    <h1 className="text-4xl font-extrabold dark:text-white mb-4">
      Neuen Betrieb eintragen
    </h1>
    <FarmForm />
  </div>
);
