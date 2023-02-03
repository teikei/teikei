import React from "react";
import { Feature, Point } from "geojson";
import DepotFarmProductList from "./DepotFarmProductList";

interface Props {
  entry: Feature<Point>;
}

const DepotDetails: React.FC<Props> = ({ entry }) => (
  <>
    <p>{entry.properties?.description}</p>
    <h2>Produkte</h2>
    {entry.properties?.farms.features.length > 0 &&
      entry.properties?.farms.features.map((farm: Feature<Point>) => (
        <DepotFarmProductList farm={farm} />
      ))}
    <h2>Abholtage</h2>
    <p>{entry.properties?.deliveryDays}</p>
  </>
);

export default DepotDetails;
