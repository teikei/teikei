import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  FeatureGroup,
  Popup,
} from "react-leaflet";
import { Feature, Point } from "geojson";
import { useQuery } from "react-query";

import { findEntries } from "../../../api/api";
import { useStore } from "../../../store";
import useConfigState from "../../../configuration";

import styles from "./Map.module.css";

const Map: React.FC = () => {
  const config = useConfigState((state) => state.config);
  // TODO initialize outside of component
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

  const showProfilePage = useStore((state) => state.showProfilePage);
  const { data, isSuccess } = useQuery(["places"], findEntries, {
    staleTime: 10000,
  });

  return (
    config.zoom && (
      <MapContainer
        center={[52.52, 13.405]}
        zoom={13}
        className={styles.mapContainer}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {isSuccess &&
          data.features.map((feature: Feature<Point>) => (
            <FeatureGroup
              key={`${feature.properties?.type}${feature.properties?.id}`}
            >
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
                <button
                  id="button"
                  className="button is-primary"
                  onClick={() =>
                    showProfilePage(
                      feature.properties?.type,
                      feature.properties?.id
                    )
                  }
                >
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
