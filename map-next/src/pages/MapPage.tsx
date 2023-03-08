import React from "react";

import { Sidebar, Navigation } from "@/components/layout";
import { Map } from "@/components/map";

import "leaflet/dist/leaflet.css";

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
