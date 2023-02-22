import React from "react";

import DetailsHeader from "../DetailsHeader/DetailsHeader";
import { membershipInfoText } from "../../../common/textContentHelpers";
import FarmDetails from "../FarmDetails/FarmDetails";
import DepotDetails from "../DepotDetails/DepotDetails";
import InitiativeDetails from "../InitiativeDetails/InitiativeDetails";
import { Depot, DetailedEntry, Farm, Initiative } from "../../../types";

import "./Details.css";

interface Props {
  entry: DetailedEntry;
}

const Details: React.FC<Props> = ({ entry }) => {
  const {
    properties: { type },
  } = entry;
  const {
    properties: { acceptsNewMembers },
  } = entry as Farm;

  return (
    <section className="prose">
      <DetailsHeader entry={entry} />
      {type === "Farm" && <FarmDetails farm={entry as Farm} />}
      {type === "Depot" && <DepotDetails depot={entry as Depot} />}
      {type === "Initiative" && (
        <InitiativeDetails initiative={entry as Initiative} />
      )}
      <h2>Kontakt</h2>
      <p>{acceptsNewMembers && membershipInfoText(acceptsNewMembers)}</p>
      {/* TODO entry contact form */}
    </section>
  );
};

export default Details;
