import React from "react";

import "leaflet/dist/leaflet.css";
import "bulma/css/bulma.css";

import Map from "../../components/Map/Map";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navigation from "../../components/Navigation/Navigation";
import { queryClient } from "../../main";
import { findEntries } from "../../api";

export const mapPageLoader = async () => {
  return queryClient.fetchQuery(["places"], findEntries, { staleTime: 10000 });
};

const MapPage: React.FC = () => {
  return (
    <div>
      <aside>
        <Sidebar />
      </aside>
      <Navigation />
      <article></article>
      <Map />
    </div>
  );
};

export default MapPage;
