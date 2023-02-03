import React from "react";

import "leaflet/dist/leaflet.css";
import "bulma/bulma.sass";

import Map from "../Map/Map";
import Sidebar from "../Sidebar/Sidebar";

const App: React.FC = () => {
  return (
    <div>
      <aside>
        <Sidebar />
      </aside>
      <article></article>
      <Map />
    </div>
  );
};

export default App;
