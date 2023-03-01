import React from "react";

import { Farm, Product } from "../../types";
import { PRODUCT_MAPPINGS } from "./ProductList";

const farmProductList = (products: Product[]) =>
  products.map((p) => PRODUCT_MAPPINGS[p.name]).join(", ");

interface Props {
  farm: Farm;
}

const FarmProductList: React.FC<Props> = ({ farm }) => {
  const {
    properties: { id, name, products },
  } = farm;

  return (
    <p key={id}>
      {farmProductList(products)} – <a href={`#/farms/${id}`}>{name}</a>
    </p>
  );
};

export default FarmProductList;
