import React from "react";

import { Sidebar, Navigation } from "@/components/layout";
import { Map } from "@/components/map";

import "leaflet/dist/leaflet.css";
import { queryClient } from "@/clients";
import { authenticate, findEntries } from "@/api";

export const mapPageLoader = async () => {
  queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
  return queryClient.fetchQuery(["entries"], () => findEntries({}), {
    staleTime: 10000,
  });
};

export const MapPage: React.FC = () => {
  return (
    <div>
      <aside>
        <Sidebar />
      </aside>
      <Navigation />
      <Map />
    </div>
  );
};
