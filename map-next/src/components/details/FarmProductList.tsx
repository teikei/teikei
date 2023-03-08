import React from "react";

import { Farm, Product } from "@/types";
import { PRODUCT_MAPPINGS } from "@/components/details";

const farmProductList = (products: Product[]) =>
  products.map((p) => PRODUCT_MAPPINGS[p.name]).join(", ");

interface Props {
  farm: Farm;
}

export const FarmProductList: React.FC<Props> = ({ farm }) => {
  const {
    properties: { id, name, products },
  } = farm;

  return (
    <p key={id}>
      {farmProductList(products)} – <a href={`#/farms/${id}`}>{name}</a>
    </p>
  );
};
