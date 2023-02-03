import React, { useMemo } from "react";
import groupBy from "lodash.groupby";

export const PRODUCT_CATEGORY_MAPPINGS: { [key: string]: string } = {
  animal_products: "Tierische Produkte",
  beverages: "Getränke",
  vegetable_products: "Pflanzliche Produkte",
};

export const PRODUCT_MAPPINGS: { [key: string]: string } = {
  vegetables: "Gemüse",
  fruits: "Obst",
  mushrooms: "Pilze",
  cereals: "Getreideprodukte (z.B. Mehl, Grieß, Nudeln)",
  bread_and_pastries: "Brot und Backwaren",
  spices: "Kräuter",
  eggs: "Eier",
  meat: "Fleisch",
  sausages: "Wurstwaren",
  milk: "Milch",
  dairy: "Milchprodukte (z.B. Butter, Käse, Joghurt)",
  fish: "Fisch",
  honey: "Honig",
  juice: "Saft",
  wine: "Wein",
  beer: "Bier",
};

export interface Product {
  id: string;
  category: string;
  name: string;
  type: string;
  link: string;
}

interface Props {
  products: Product[];
}

const FarmProducts: React.FC<Props> = ({ products }) => {
  const groupedProducts = useMemo(
    () => groupBy(products, "category"),
    [products]
  );

  return (
    <>
      {Object.keys(groupedProducts).map((c) => (
        <div key={c}>
          <h2>{PRODUCT_CATEGORY_MAPPINGS[c]}</h2>
          <ul>
            {groupedProducts[c].map((p) => (
              <li key={p.name}>{PRODUCT_MAPPINGS[p.name]}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};

export default FarmProducts;
