import React from "react";
import { useQuery } from "react-query";

import { MyEntriesNavigation } from "@/components/entries/MyEntriesNavigation";
import { MyEntriesListItem } from "@/components/entries/MyEntriesListItem";
import { authenticate, findEntries } from "@/api";
import { queryClient } from "@/clients";

export const myEntriesLoader = async () => {
  // TODO redirect if not authenticated
  await queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
  return queryClient.fetchQuery(
    ["places", "mine"],
    () => findEntries({ mine: true }),
    {
      staleTime: 10000,
    }
  );
};

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
