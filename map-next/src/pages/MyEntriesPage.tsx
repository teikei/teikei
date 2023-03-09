import React, { useState } from "react";
import { useQuery } from "react-query";

import { MyEntriesNavigation } from "@/components/entries/MyEntriesNavigation";
import { MyEntriesListItem } from "@/components/entries/MyEntriesListItem";
import { authenticate, findEntries } from "@/api";
import { queryClient } from "@/clients";
import { Entry } from "@/types";
import { DeleteEntryDialog } from "@/components/entries/DeleteEntryDialog";

export const myEntriesLoader = async () => {
  // TODO redirect if not authenticated
  await queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
  return queryClient.fetchQuery(
    ["entries", "mine"],
    () => findEntries({ mine: true }),
    {
      staleTime: 10000,
    }
  );
};

const keyOf = (entry: Entry) => {
  const { id, type } = entry.properties;
  return `${id}${type}`;
};

export const MyEntriesPage: React.FC = () => {
  const { data, isSuccess } = useQuery(["entries", "mine"], () =>
    findEntries({ mine: true })
  );

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  return (
    <div className="p-5">
      <h1 className="text-4xl font-extrabold dark:text-white mb-4">
        Meine Einträge
      </h1>
      <DeleteEntryDialog entry={selectedEntry} setEntry={setSelectedEntry} />
      <MyEntriesNavigation />
      {isSuccess &&
        data.features.map((entry) => {
          return (
            <MyEntriesListItem
              entry={entry}
              onDelete={(entry) => setSelectedEntry(entry)}
              key={keyOf(entry)}
            />
          );
        })}
    </div>
  );
};
