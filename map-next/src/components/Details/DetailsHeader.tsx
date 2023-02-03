import React from "react";
import { Feature, Point } from "geojson";
import { foundedAtText } from "./textHelpers";
import ExternalLink from "./ExternalLink";

interface Props {
  entry: Feature<Point>;
}

const DetailsHeader: React.FC<Props> = ({ entry }) => {
  return (
    <>
      <h1>{entry.properties?.name}</h1>
      <p>
        {entry.properties?.foundedAtYear &&
          foundedAtText(
            entry.properties?.foundedAtYear,
            entry.properties?.foundedAtMonth
          )}
      </p>
      <p>
        {entry.properties?.postalcode} {entry.properties?.city} |{" "}
        {entry.properties?.url && <ExternalLink url={entry.properties?.url} />}
      </p>
    </>
  );
};

export default DetailsHeader;
