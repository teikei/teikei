import React from "react";

import { Depot, DetailedEntry, Farm, Initiative } from "@/types";
import { membershipInfoText } from "@/common/textContentHelpers";
import DetailsHeader from "@/components/details/DetailsHeader";
import FarmDetails from "@/components/details/FarmDetails";
import DepotDetails from "@/components/details/DepotDetails";
import InitiativeDetails from "@/components/details/InitiativeDetails";

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
