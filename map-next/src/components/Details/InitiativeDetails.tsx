import React, { useMemo } from "react";
import { Feature, Point } from "geojson";
import FarmBadges from "./FarmBadges";
import { Badge } from "./Details";

const GOAL_MAPPINGS: { [key: string]: string } = {
  land: "Wir suchen Land oder Hof",
  staff: "Wir suchen GärtnerInnen oder LandwirtInnen",
  organizers: "Wir suchen Mitglieder für unser Organisationsteam",
  consumers: "Wir suchen KonsumentInnen",
};

interface Goal {
  id: string;
  name: string;
  type: string;
  link: string;
}

interface Props {
  entry: Feature<Point>;
}

const InitiativeDetails: React.FC<Props> = ({ entry }) => {
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
      {entry.properties?.goals.length > 0 && (
        <ul>
          {entry.properties?.goals.map((goal: Goal) => (
            <li key={goal.id}>{GOAL_MAPPINGS[goal.name]}</li>
          ))}
        </ul>
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
    </>
  );
};

export default InitiativeDetails;
