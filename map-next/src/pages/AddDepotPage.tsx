import React from "react";

import { DepotForm } from "@/components/entries";
import { queryClient } from "@/clients";
import { authenticate } from "@/api";

// TODO move to entry page? unify entry pages with different outlets for each entry type (farm/depot/initiative)?
export const addEntryPageLoader = async () => {
  // TODO redirect if not authenticated
  return queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
};

export const AddDepotPage: React.FC = () => (
  <div className="p-5">
    <h1 className="text-4xl font-extrabold dark:text-white mb-4">
      Neues Depot eintragen
    </h1>
    <DepotForm />
  </div>
);
