import React from "react";

import { Depot, DetailedEntry, Farm, Initiative } from "@/types";
import { membershipInfoText } from "@/common/textContentHelpers";
import {
  DetailsHeader,
  FarmDetails,
  DepotDetails,
  InitiativeDetails,
} from "@/components/details";

interface Props {
  entry: DetailedEntry;
}

export const Details: React.FC<Props> = ({ entry }) => {
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
