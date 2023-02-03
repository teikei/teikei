import React, { useMemo } from "react";
import { Feature, Point } from "geojson";
import FarmProducts from "./FarmProducts";
import FarmDepots from "./FarmDepots";
import FarmBadges from "./FarmBadges";
import { Badge } from "./Details";

interface Props {
  entry: Feature<Point>;
}

const FarmDetails: React.FC<Props> = ({ entry }) => {
  const associationBadges = useMemo(
    () =>
      entry.properties?.badges.filter(
        (b: Badge) => b.category === "associations"
      ),
    [entry]
  );
  const certificationBadges = useMemo(
    () =>
      entry.properties?.badges.filter(
        (b: Badge) => b.category === "certifications"
      ),
    [entry]
  );

  return (
    <>
      <p>{entry.properties?.description}</p>
      <FarmProducts products={entry.properties?.products} />
      <h2>Zusätzliche Informationen zum Lebensmittelangebot</h2>
      <p>{entry.properties?.additionalProductInformation}</p>
      <h2>Wirtschaftsweise</h2>
      <ul>
        {entry.properties?.actsEcological && (
          <li>Dieser Hof wirtschaftet ökologisch.</li>
        )}
        {entry.properties?.economicalBehavior && (
          <li>{entry.properties?.economicalBehavior}</li>
        )}
      </ul>
      {entry.properties?.depots.features.length > 0 && (
        <FarmDepots depots={entry.properties?.depots.features} />
      )}
      {associationBadges.length > 0 && (
        <>
          <h2>Mitgliedschaften</h2>
          <FarmBadges badges={associationBadges} />
        </>
      )}
      {certificationBadges.length > 0 && (
        <>
          <h2>Zertifizierungen</h2>
          <FarmBadges badges={certificationBadges} />
        </>
      )}
      <h2>Mitgliederbeteiligung</h2>
      <p>{entry.properties?.participation}</p>
      <p>Maximale Mitgliederzahl: {entry.properties?.maximumMembers}</p>
    </>
  );
};

export default FarmDetails;
