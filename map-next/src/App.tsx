import React, { useEffect } from "react";
import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import { create } from "zustand";

import "leaflet/dist/leaflet.css";
import "bulma/bulma.sass";

import Map from "./Map";
import { Feature, Point } from "geojson";

interface PlacesState {
  places: Feature<Point>[];
  findPlaces: () => void;
}

const app = createFeathersClient();
const restClient = rest("http://localhost:3030");
app.configure(restClient.fetch(window.fetch.bind(window)));

const entriesService = app.service("entries");

const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  findPlaces: async () => {
    const response = await entriesService.find();
    set({ places: response.features });
  },
}));

const App: React.FC = () => {
  const places = usePlacesStore((state) => state.places);
  const findPlaces = usePlacesStore((state) => state.findPlaces);
  useEffect(() => {
    findPlaces();
  }, []);
  return (
    <div className="App">
      <section className="section">
        <div className="container">
          <h1 className="title">Teikei</h1>
          <p className="subtitle">Places:</p>
          <Map places={places} />
        </div>
      </section>
    </div>
  );
};

export default App;
