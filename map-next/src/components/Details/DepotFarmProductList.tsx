import React from "react";
import { Feature, Point } from "geojson";

import { PRODUCT_MAPPINGS } from "./FarmProducts";
import { Product } from "../../types";

const farmProductList = (products: Product[]) =>
  Array.from(new Set(products))
    .map((p) => PRODUCT_MAPPINGS[p.name])
    .join(", ");

interface Props {
  farm: Feature<Point>;
}

const DepotFarmProductList: React.FC<Props> = ({ farm }) => {
  return (
    <p key={farm.properties?.id}>
      {farmProductList(farm.properties?.products)} –{" "}
      <a href={`#/farms/${farm.properties?.id}`}>{farm.properties?.name}</a>
    </p>
  );
};

export default DepotFarmProductList;
