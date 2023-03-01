import React from "react";

import { Depot } from "../../types";
import FarmProductList from "./FarmProductList";

interface Props {
  depot: Depot;
}

const DepotDetails: React.FC<Props> = ({ depot }) => {
  const {
    properties: { description, farms, deliveryDays },
  } = depot;

  return (
    <>
      <p>{description}</p>
      <h2>Produkte</h2>
      {farms.features.length > 0 &&
        farms.features.map((farm) => <FarmProductList farm={farm} />)}
      <h2>Abholtage</h2>
      <p>{deliveryDays}</p>
    </>
  );
};

export default DepotDetails;
