import React from "react";

import { Entry, Farm } from "@/types";
import { foundedAtText } from "@/common/textContentHelpers";
import ExternalLink from "@/components/details/ExternalLink";

interface Props {
  entry: Entry;
}

const DetailsHeader: React.FC<Props> = ({ entry }) => {
  const {
    properties: { name, postalcode, city, url },
  } = entry;
  const {
    properties: { foundedAtYear, foundedAtMonth },
  } = entry as Farm;

  return (
    <>
      <h1>{name}</h1>
      <p>{foundedAtYear && foundedAtText(foundedAtYear, foundedAtMonth)}</p>
      <p>
        {postalcode} {city} | {url && <ExternalLink url={url} />}
      </p>
    </>
  );
};

export default DetailsHeader;
