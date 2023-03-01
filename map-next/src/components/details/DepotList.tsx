import React from "react";

import { Depot } from "../../types";

interface Props {
  depots: Depot[];
}

const DepotList: React.FC<Props> = ({ depots }) => (
  <>
    <h2>Abholstellen (Depots)</h2>
    <ul>
      {depots.map((depot) => {
        const {
          properties: { id, type, name },
        } = depot;

        return (
          <li key={id} className={type.toLowerCase()}>
            <a href={`#depots/${id}`} title={name}>
              {name}
            </a>
          </li>
        );
      })}
    </ul>
  </>
);

export default DepotList;
