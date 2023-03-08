import React from "react";

import { DepotForm } from "@/components/entries";

export const AddDepotPage: React.FC = () => (
  <div className="p-5">
    <h1 className="text-4xl font-extrabold dark:text-white mb-4">
      Neues Depot eintragen
    </h1>
    <DepotForm />
  </div>
);
