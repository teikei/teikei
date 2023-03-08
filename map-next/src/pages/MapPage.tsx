import React from "react";

import { queryClient } from "@/main";
import { authenticate, findEntries } from "@/api";
import Map from "@/components/map/Map";
import Sidebar from "@/components/layout/Sidebar";
import Navigation from "@/components/layout/Navigation";

import "leaflet/dist/leaflet.css";

export const mapPageLoader = async () => {
  return queryClient.fetchQuery(["places"], () => findEntries({}), {
    staleTime: 10000,
  });
};

// TODO move to entry page? unify entry pages with different outlets for each entry type (farm/depot/initiative)?
export const addEntryPageLoader = async () => {
  return queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
};

const MapPage: React.FC = () => {
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

export default MapPage;
