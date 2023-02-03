import React from "react";
import { Feature } from "geojson";

interface Props {
  depots: Feature[];
}

const FarmDepots: React.FC<Props> = ({ depots }) => (
  <>
    <h2>Abholstellen (Depots)</h2>
    <ul>
      {depots.map((depot: any) => (
        <li
          key={depot.properties?.id}
          className={depot.properties?.type.toLowerCase()}
        >
          <a
            href={`#depots/${depot.properties?.id}`}
            title={depot.properties?.name}
          >
            {depot.properties?.name}
          </a>
        </li>
      ))}
    </ul>
  </>
);

export default FarmDepots;
