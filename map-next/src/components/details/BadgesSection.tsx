import React from "react";

import { Badge } from "@/types";

interface Props {
  badges: Badge[];
}

export const BadgesSection: React.FC<Props> = ({ badges }) => (
  <div>
    {badges.map((badge) => (
      <div key={badge.id}>
        <div onClick={(event) => event.preventDefault()}>
          {(badge.name && badge.name) || ""}
        </div>
        <a href={badge.url} target="_blank" rel="noopener noreferrer">
          <img src={badge.logo} height={50} />
        </a>
      </div>
    ))}
  </div>
);
