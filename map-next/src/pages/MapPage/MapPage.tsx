import React, { useState } from "react";

import "leaflet/dist/leaflet.css";
import "bulma/css/bulma.css";

import Map from "../../components/map/Map/Map";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Navigation from "../../components/layout/Navigation/Navigation";
import { findEntries, queryClient } from "../../api/api";
import { Transition } from "@headlessui/react";

export const mapPageLoader = async () => {
  return queryClient.fetchQuery(["places"], findEntries, { staleTime: 10000 });
};

const MapPage: React.FC = () => {
  const [isShowing, setIsShowing] = useState(false);
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
