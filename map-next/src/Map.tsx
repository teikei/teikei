import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  FeatureGroup,
  Popup,
} from "react-leaflet";
import { Feature, Point } from "geojson";

import "./Map.css";
import useConfigState from "./configuration";

interface Props {
  places: Feature<Point>[];
}

const Map: React.FC<Props> = ({ places }) => {
  const config = useConfigState((state) => state.config);
  const initialize = useConfigState((state) => state.initialize);
  useEffect(() => {
    initialize({
      countries: {
        DE: {
          center: [51.1657, 10.4515],
          zoom: 7,
        },
      },
    });
  }, []);

  return (
    config.zoom &&
    places && (
      <MapContainer
        center={[52.52, 13.405]}
        zoom={13}
        className="map-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {places &&
          places.map((feature: Feature<Point>) => (
            <FeatureGroup key={feature.properties?.id}>
              <Circle
                center={[
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ]}
                fillColor="#33CC99"
                radius={200}
                color="#000"
                weight={1}
                opacity={1}
                fillOpacity={0.8}
              />
              <Popup>
                <p>{feature.properties?.name}</p>
                <button id="button" className="button is-primary">
                  Details
                </button>
              </Popup>
            </FeatureGroup>
          ))}
      </MapContainer>
    )
  );
};

export default Map;
