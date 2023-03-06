import React, { useMemo } from "react";

import { Badge, Farm } from "@/types";
import ProductList from "@/components/details/ProductList";
import DepotList from "@/components/details/DepotList";
import BadgesSection from "@/components/details/BadgesSection";

interface Props {
  farm: Farm;
}

const FarmDetails: React.FC<Props> = ({ farm }) => {
  const {
    properties: {
      badges,
      description,
      additionalProductInformation,
      actsEcological,
      economicalBehavior,
      products,
      depots,
      participation,
      maximumMembers,
    },
  } = farm;

  const associationBadges = useMemo(
    () => badges.filter((b: Badge) => b.category === "associations"),
    [farm]
  );
  const certificationBadges = useMemo(
    () => badges.filter((b: Badge) => b.category === "certifications"),
    [farm]
  );

  return (
    <>
      <p>{description}</p>
      <ProductList products={products} />
      <h2>Zusätzliche Informationen zum Lebensmittelangebot</h2>
      <p>{additionalProductInformation}</p>
      <h2>Wirtschaftsweise</h2>
      <ul>
        {actsEcological && <li>Dieser Hof wirtschaftet ökologisch.</li>}
        {economicalBehavior && <li>{economicalBehavior}</li>}
      </ul>
      {depots.features.length > 0 && <DepotList depots={depots.features} />}
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
      <h2>Mitgliederbeteiligung</h2>
      <p>{participation}</p>
      <p>Maximale Mitgliederzahl: {maximumMembers}</p>
    </>
  );
};

export default FarmDetails;
