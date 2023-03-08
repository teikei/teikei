import React from "react";
import { useQuery } from "react-query";

import { MyEntriesNavigation } from "@/components/entries/MyEntriesNavigation";
import { MyEntriesListItem } from "@/components/entries/MyEntriesListItem";
import { findEntries } from "@/api";

export const MyEntriesPage: React.FC = () => {
  const { data, isSuccess } = useQuery(["places", "mine"], () =>
    findEntries({ mine: true })
  );

  console.log("data", data);

  return (
    <div className="p-5">
      <h1 className="text-4xl font-extrabold dark:text-white mb-4">
        Meine Einträge
      </h1>
      <MyEntriesNavigation />
      {isSuccess &&
        data.features.map((entry) => <MyEntriesListItem entry={entry} />)}
    </div>
  );
};
