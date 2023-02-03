import React from "react";
import { Feature, Point } from "geojson";
import DetailsHeader from "./DetailsHeader";
import { membershipInfoText } from "./textHelpers";
import FarmDetails from "./FarmDetails";
import DepotDetails from "./DepotDetails";

export interface Badge {
  id: string;
  category: string;
  name: string;
  url: string;
  logo: string;
}

interface Props {
  entry: Feature<Point>;
}

const Details: React.FC<Props> = ({ entry }) => (
  <section className="section content">
    <DetailsHeader entry={entry} />
    {entry.properties?.type === "Farm" && <FarmDetails entry={entry} />}
    {entry.properties?.type === "Depot" && <DepotDetails entry={entry} />}
    <h2>Kontakt</h2>
    <p>{membershipInfoText(entry.properties?.acceptsNewMembers)}</p>
    {/* TODO entry contact form */}
  </section>
);

export default Details;
