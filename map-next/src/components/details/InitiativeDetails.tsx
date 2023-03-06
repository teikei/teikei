import React, { useMemo } from "react";

import { Badge, Goal, Initiative } from "@/types";
import BadgesSection from "@/components/details/BadgesSection";

const GOAL_MAPPINGS: { [key: string]: string } = {
  land: "Wir suchen Land oder Hof",
  staff: "Wir suchen GärtnerInnen oder LandwirtInnen",
  organizers: "Wir suchen Mitglieder für unser Organisationsteam",
  consumers: "Wir suchen KonsumentInnen",
};

interface Props {
  initiative: Initiative;
}

const InitiativeDetails: React.FC<Props> = ({ initiative }) => {
  const {
    properties: { badges, description, goals },
  } = initiative;
  const associationBadges = useMemo(
    () => badges.filter((b: Badge) => b.category === "associations"),
    [initiative]
  );
  const certificationBadges = useMemo(
    () => badges.filter((b: Badge) => b.category === "certifications"),
    [initiative]
  );

  return (
    <>
      <p>{description}</p>
      {goals.length > 0 && (
        <ul>
          {goals.map((goal: Goal) => (
            <li key={goal.id}>{GOAL_MAPPINGS[goal.name]}</li>
          ))}
        </ul>
      )}
      {associationBadges.length > 0 && (
        <>
          <h2>Mitgliedschaften</h2>
          <BadgesSection badges={associationBadges} />
        </>
      )}
      {certificationBadges.length > 0 && (
        <>
          <h2>Zertifizierungen</h2>
          <BadgesSection badges={certificationBadges} />
        </>
      )}
    </>
  );
};

export default InitiativeDetails;
