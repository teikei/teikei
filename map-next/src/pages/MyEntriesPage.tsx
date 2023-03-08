import React from "react";

import { queryClient } from "@/main";
import { findEntries } from "@/api";
import { MyEntriesNavigation } from "@/components/entries/MyEntriesNavigation";

export const myEntriesLoader = async () => {
  return queryClient.fetchQuery(
    ["places", "mine"],
    () => findEntries({ mine: true }),
    {
      staleTime: 10000,
    }
  );
};

const MapPage: React.FC = () => {
  return (
    <div>
      <MyEntriesNavigation />
    </div>
  );
};

export default MapPage;
